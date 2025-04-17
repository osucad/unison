import { DDSFactory, DDSFactoryOrClass, normalizeDDSFactory } from "@unison/dds-base";
import { Document, IDocumentOptions } from "../runtime/Document.js";
import { DocumentSchema, normalizeDocumentSchema, UnwrapDocumentSchema } from "./DocumentSchema.js";
import { ITokenProvider } from "./ITokenProvider.js";

export interface IUnisonClientOptions 
{
  tokenProvider: ITokenProvider;
  endpoints: IEndpointConfiguration;
}

export interface IEndpointConfiguration 
{
  api: string;
  ordererUrl: string;
}

export class UnisonClient 
{
  constructor(options: IUnisonClientOptions) 
  {
    this.tokenProvider = options.tokenProvider;
    this.endpoints = options.endpoints;
  }

  private readonly tokenProvider: ITokenProvider;
  private readonly endpoints: IEndpointConfiguration;

  public async createDocument<T extends DocumentSchema>(options: CreateDocumentOptions<T>): Promise<Document<UnwrapDocumentSchema<T>>> 
  {
    const schema = normalizeDocumentSchema(options.schema);

    const types: DDSFactory[] = (options.types ?? []).map(normalizeDDSFactory);
    for (const factory of Object.values(schema)) 
    {
      if (!types.some(it => it.attributes.type === factory.attributes.type))
        types.push(factory);
    }

    const documentOptions: IDocumentOptions = {
      schema,
      types,
    };

    const document = Document.createDetached(documentOptions);

    return document as unknown as Document<UnwrapDocumentSchema<T>>;
  }
}

export interface CreateDocumentOptions<T extends DocumentSchema> 
{
  readonly schema: T;
  readonly types?: readonly DDSFactoryOrClass[];
}

