import { IOperation, MessageType } from "@unison/shared-definitions";
import { DDS, DDSAttributes, DDSFactory } from "../dds/index.js";
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

  readonly runtime: DocumentRuntime;

  id: string | null = null;

  constructor(types: readonly DDSFactory[]) 
  {
    this.runtime = new DocumentRuntime(types);
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

  static createDetached<T extends DocumentSchema>(options: IDocumentOptions<T>): Document<UnwrapDocumentSchema<T>> 
  {
    const document = new Document<UnwrapDocumentSchema<T>>(options.types);

    document.createDetached(options.schema);

    return document;
  }

  private load(
    schema: DocumentSchema,
    summary: IDocumentSummary,
    deltas: DeltaManager)
  {
    this.runtime.load(summary.entries);

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
      deltas.submitOps({
        clientSequenceNumber: 0,
        type: MessageType.Delta,
        contents: [
          {
            target: dds?.id ?? null,
            contents: op
          }
        ]
      });
    });

    deltas.on("deltas", (message, local) => 
    {
      if (message.type === MessageType.Delta) 
      {
        this.runtime.process(message.operation as IOperation[], local);
      }
    });

    deltas.resume();
  }

  static load<T extends DocumentSchema>(
    documentId: string,
    options: IDocumentOptions<T>,
    summary: IDocumentSummary,
    deltas: DeltaManager,
  ) 
  {
    const document = new Document<UnwrapDocumentSchema<T>>(options.types);

    document.id = documentId;
    document.load(options.schema, summary, deltas);

    return document;
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