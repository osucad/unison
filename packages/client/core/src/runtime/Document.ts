import { StorageService } from "../client/StorageService.js";
import { TokenProvider } from "../client/TokenProvider.js";
import { DDS, DDSAttributes, DDSFactory } from "../dds/index.js";
import { ConnectionFactory } from "../services/ConnectionFactory.js";
import { nn } from "../utils/nn.js";
import { DeltaManager } from "./DeltaManager.js";
import { DocumentRuntime } from "./DocumentRuntime.js";
import { DocumentSchema, UnwrapDocumentSchema } from "./DocumentSchema.js";

export interface IDocumentOptions<T extends DocumentSchema> 
{
  schema: T;
  types: readonly DDSFactory[];
}

export class Document<T extends object = object> 
{
  root!: T;

  runtime!: DocumentRuntime;

  private deltaManager: DeltaManager;
  private storageService: StorageService;

  id: string | null = null;

  constructor(
    {
      storageService,
      tokenProvider,
      connectionFactory,
      ddsTypes,
    }: {
      storageService: StorageService;
      tokenProvider: TokenProvider;
      connectionFactory: ConnectionFactory;
      ddsTypes: readonly DDSFactory[];
    }
  ) 
  {
    this.runtime = new DocumentRuntime(ddsTypes);
    this.storageService = storageService;
    this.deltaManager = new DeltaManager(connectionFactory, tokenProvider);
  }

  private createDetached(schema: DocumentSchema) 
  {
    const root: Record<string, DDS> = {};

    for (const key in schema)
      root[key] = this.runtime.create(schema[key]);

    this.root = Object.freeze(root) as T;
  }


  createSummary(): IDocumentSummary 
  {
    const entryPoint = Object.values(this.root);

    const entries = this.runtime.createSummary(entryPoint);

    const entryPointMap: Record<string, string> = {};

    for (const [key, value] of Object.entries(this.root))
      entryPointMap[key] = value.id;

    return {
      entryPoint: entryPointMap,
      entries,
    };
  }

  static createDetached<T extends DocumentSchema>(
    {
      schema,
      ddsTypes,
      connectionFactory,
      tokenProvider,
      storageService,
    }: {
      schema: T;
      ddsTypes: readonly DDSFactory[];
      connectionFactory: ConnectionFactory;
      tokenProvider: TokenProvider;
      storageService: StorageService;
    }
  ): Document<UnwrapDocumentSchema<T>>
  {
    const document = new Document({
      ddsTypes,
      connectionFactory,
      tokenProvider,
      storageService,
    });

    document.createDetached(schema);

    return document as  Document<UnwrapDocumentSchema<T>>;
  }

  private async load(
    documentId: string,
    schema: DocumentSchema,
  ) 
  {
    const summary = await this.storageService.getSummary(documentId);

    this.runtime.load(summary.entries);

    const connectP = this.deltaManager.connect(documentId);

    const root: Record<string, DDS> = {};

    for (const [key, value] of Object.entries(summary.entryPoint))
      root[key] = nn(this.runtime.getObject(value));

    console.assert(
      Object.keys(schema).length === Object.keys(summary.entryPoint).length
    );

    for (const key in schema)
      console.assert(key in root);

    this.root = Object.freeze(root) as T;

    this.runtime.on("localOp", (dds, op) =>
    {
      this.deltaManager.submitOps({
        clientSequenceNumber: 0,
        type: "op",
        contents: [
          {
            target: dds?.id ?? null,
            contents: op
          }
        ],
      });
    });

    this.deltaManager.on("deltas", (message, local) =>
    {
      const operation = message.contents;

      if (operation.type === "op")
      {
        for (const op of operation.contents)
        {
          this.runtime.process({
            ...message,
            type: operation.type,
            contents: op,
          }, local);
        }
      }
    });

    await connectP;

    this.deltaManager.resume();
  }

  static async load<T extends DocumentSchema>(
    {
      documentId,
      schema,
      ddsTypes,
      connectionFactory,
      storageService,
      tokenProvider,
    }: {
      documentId: string;
      schema: T;
      ddsTypes: readonly DDSFactory[];
      connectionFactory: ConnectionFactory;
      storageService: StorageService;
      tokenProvider: TokenProvider;
    },
  ) 
  {
    const document = new Document({
      storageService,
      tokenProvider,
      connectionFactory,
      ddsTypes,
    });

    await document.load(documentId, schema);

    return document as Document<UnwrapDocumentSchema<T>>;
  }
}

export interface IDocumentSummary 
{
  entryPoint: Record<string, string>;
  entries: Record<string, IObjectSummary>;
}

export interface IObjectSummary 
{
  attributes: DDSAttributes;
  contents: unknown;
}