import { DocumentSchema, UnwrapDocumentSchema } from "../runtime/DocumentSchema.js";
import { Document, IDocumentOptions } from "../runtime/index.js";
import { ConnectionFactory } from "../services/ConnectionFactory.js";
import { InsecureTokenProvider } from "./InsecureTokenProvider.js";
import { StorageService } from "./StorageService.js";
import { TokenProvider } from "./TokenProvider.js";

export class UnisonClient 
{
  constructor(readonly endpoint: string) 
  {
    this.tokenProvider = new InsecureTokenProvider();
    this.storageService = new StorageService(this.endpoint, this.tokenProvider);
    this.connectionFactory = new ConnectionFactory(this.endpoint);
  }

  private readonly tokenProvider: TokenProvider;
  private readonly storageService: StorageService;
  private readonly connectionFactory: ConnectionFactory;

  async createDocument<T extends DocumentSchema>(options: IDocumentOptions<T>): Promise<Document<UnwrapDocumentSchema<T>>>
  {
    const document = Document.createDetached({
      schema: options.schema,
      ddsTypes: options.types,
      connectionFactory: this.connectionFactory,
      storageService: this.storageService,
      tokenProvider: this.tokenProvider,
    });

    const summary = document.createSummary();

    const { id } = await this.storageService.createDocument(summary);

    document.id = id;

    return document;
  }

  async load<T extends DocumentSchema>(documentId: string, options: IDocumentOptions<T>)
  {
    return Document.load({
      documentId,
      schema: options.schema,
      ddsTypes: options.types,
      connectionFactory: this.connectionFactory,
      storageService: this.storageService,
      tokenProvider: this.tokenProvider,
    });
  }
}