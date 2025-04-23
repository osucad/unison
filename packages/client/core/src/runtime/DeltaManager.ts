import { DocumentMessage, DocumentOperation, PROTOCOL_VERSION, SequencedMessage } from "@unison/shared-definitions";
import Dequeue from "double-ended-queue";
import { EventEmitter } from "eventemitter3";
import { TokenProvider } from "../client/TokenProvider.js";
import { ConnectionFactory, UnisonClientSocket } from "../services/ConnectionFactory.js";
import { nn } from "../utils/nn.js";

export class DeltaManager extends EventEmitter<{
  deltas(deltas: SequencedMessage<DocumentMessage>, local: boolean): void;
}> 
{
  private readonly queue = new Dequeue<SequencedMessage<DocumentMessage>>();

  private socket?: UnisonClientSocket;
  private documentId!: string;
  private clientId!: string;

  constructor(
    private readonly connectionFactory: ConnectionFactory,
    private readonly tokenProvider: TokenProvider,
  ) 
  {
    super();
  }

  private paused = true;

  resume() 
  {
    this.paused = false;

    this.processQueue();
  }

  pause() 
  {
    this.paused = true;
  }

  submitOps(message: DocumentOperation) 
  {
    if (!this.socket)
      return;

    this.socket.emit("submitOps", this.documentId, message);
  }

  async connect(documentId: string) 
  {
    this.socket = await this.connectionFactory.getConnection();
    this.documentId = documentId;
    this.clientId = nn(this.socket.id);

    this.setupEventListeners(this.socket);

    const { token } = await this.tokenProvider.getToken(documentId);

    const connectResult = await this.socket.emitWithAck("connectDocument", {
      documentId,
      version: PROTOCOL_VERSION,
      token,
    });

    if (!connectResult.success) 
    {
      this.socket.disconnect();
      this.socket = undefined;
      throw new Error(`Failed to connect to document: ${connectResult.error}`);
    }
  }

  private setupEventListeners(socket: UnisonClientSocket) 
  {
    socket.on("deltas", (documentId, deltas) => 
    {
      if (documentId !== this.documentId)
        return;

      if (this.paused) 
      {
        this.queue.push(...deltas);
        return;
      }

      this.processQueue();

      for (const msg of deltas)
        this.emit("deltas", msg, msg.clientId === socket.id);
    });
  }

  private processQueue() 
  {
    let msg = this.queue.dequeue();

    while (msg !== undefined)
    {
      this.emit("deltas", msg, msg.clientId === this.clientId);
      msg = this.queue.dequeue();
    }
  }
}