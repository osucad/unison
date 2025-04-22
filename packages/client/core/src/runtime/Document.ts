import { DDS, DDSFactory } from "../dds/index.js";
import { DocumentRuntime } from "./DocumentRuntime.js";
import { DocumentSchema, UnwrapDocumentSchema } from "./DocumentSchema.js";

export interface ICreateDocumentOptions<T extends DocumentSchema>
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

  static createDetached<T extends DocumentSchema>(options: ICreateDocumentOptions<T>): Document<UnwrapDocumentSchema<T>>
  {
    const document = new Document<UnwrapDocumentSchema<T>>(options.types);

    document.createDetached(options.schema);

    return document;
  }
}