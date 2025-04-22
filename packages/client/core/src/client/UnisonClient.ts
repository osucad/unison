import { DocumentSchema, UnwrapDocumentSchema } from "../runtime/DocumentSchema.js";
import { Document, ICreateDocumentOptions } from "../runtime/index.js";

export class UnisonClient 
{
  constructor(readonly endpoint: string) 
  {
  }

  async create<T extends DocumentSchema>(options: ICreateDocumentOptions<T>): Promise<Document<UnwrapDocumentSchema<T>>> 
  {
    const document = new Document<UnwrapDocumentSchema<T>>(options.types);

    return document;
  }
}