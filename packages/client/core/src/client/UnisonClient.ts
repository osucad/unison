import { DeltaManager } from "../runtime/DeltaManager.js";
import { DocumentSchema, UnwrapDocumentSchema } from "../runtime/DocumentSchema.js";
import { Document, IDocumentOptions } from "../runtime/index.js";
import { StorageService } from "./StorageService.js";
import { InsecureTokenProvider } from "./InsecureTokenProvider.js";
import { TokenProvider } from "./TokenProvider.js";
import { io, Socket } from "socket.io-client";
import { ClientMessages, PROTOCOL_VERSION, ScopeTypes, ServerMessages } from "@unison/shared-definitions";

export class UnisonClient 
{
  constructor(readonly endpoint: string) 
  {
    this.tokenProvider = new InsecureTokenProvider();
    this.storageService = new StorageService(this.endpoint, this.tokenProvider);
  }

  private readonly tokenProvider: TokenProvider;
  private readonly storageService: StorageService;

  async createDocument<T extends DocumentSchema>(options: IDocumentOptions<T>): Promise<Document<UnwrapDocumentSchema<T>>>
  {
    const document = Document.createDetached(options);

    const summary = document.createSummary();

    const { id } = await this.storageService.createDocument(summary);

    document.id = id;

    return document;
  }

  async load<T extends DocumentSchema>(documentId: string, options: IDocumentOptions<T>)
  {
    const summary = await this.storageService.getSummary(documentId);

    const socket: Socket<ServerMessages, ClientMessages> = io(this.endpoint, {
      transports: ["websocket"]
    });

    await waitForConnect(socket);

    const deltas = new DeltaManager(documentId, socket);

    const { token } = await this.tokenProvider.getToken(documentId);

    const result = await socket.emitWithAck("connectDocument", {
      version: PROTOCOL_VERSION,
      documentId,
      token
    });

    if (!result.success)
      throw new Error(`Failed to connect to document: ${result.error ?? "Unknown error"}`);

    return Document.load(documentId, options, summary, deltas);
  }
}

function waitForConnect(socket: Socket)
{
  return new Promise<void>((resolve, reject) => 
  {
    socket.once("connect", () => resolve());
    socket.once("connect_error", reject);
  });
}