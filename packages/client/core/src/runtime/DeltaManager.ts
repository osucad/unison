import { DocumentMessage, DocumentOperation, PROTOCOL_VERSION, SequencedMessage } from "@unison/shared-definitions";
import Dequeue from "double-ended-queue";
import { EventEmitter } from "eventemitter3";
import { TokenProvider } from "../client/TokenProvider.js";
import { ConnectionFactory, UnisonClientSocket } from "../services/ConnectionFactory.js";
import { nn } from "../utils/nn.js";
import { DocumentRuntime } from "./DocumentRuntime.js";

export class DeltaManager extends EventEmitter<{
  deltas(deltas: SequencedMessage<DocumentMessage>, local: boolean): void;
}> 
{
  private readonly queue = new Dequeue<SequencedMessage<DocumentMessage>>();

  private socket?: UnisonClientSocket;
  private documentId!: string;
  private clientId!: string;

  constructor(
    private readonly runtime: DocumentRuntime,
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

      for (const message of deltas)
        this.process(message);
    });

    this.runtime.on("localOp", (dds, op) =>
    {
      this.submitOps({
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
  }

  private processQueue() 
  {
    let message = this.queue.dequeue();

    while (message !== undefined)
    {
      this.process(message);
      message = this.queue.dequeue();
    }
  }

  private process(message: SequencedMessage<DocumentMessage>)
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
        }, message.clientId === this.clientId);
      }
    }
  }
}