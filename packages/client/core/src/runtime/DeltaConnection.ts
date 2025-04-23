import { ClientMessages, IDocumentDelta, ISequencedDocumentMessage, ServerMessages } from "@unison/shared-definitions";
import Dequeue from "double-ended-queue";
import { EventEmitter } from "eventemitter3";
import { Socket } from "socket.io-client";

export class DeltaConnection extends EventEmitter<{
  deltas(deltas: ISequencedDocumentMessage, local: boolean): void;
}>
{
  private readonly queue = new Dequeue<ISequencedDocumentMessage>();

  constructor(
    private readonly documentId: string,
    private readonly socket: Socket<ServerMessages, ClientMessages>,
  )
  {
    super();

    socket.on("deltas", (documentId, deltas) =>
    {
      if (documentId !== this.documentId)
        return;

      if (this.paused)
        this.queue.push(...deltas);

      for (const msg of deltas)
        this.emit("deltas", msg, msg.clientId === socket.id);
    });
  }

  private paused = true;

  resume() 
  {
    this.paused = false;

    let msg = this.queue.dequeue();

    while(msg !== undefined)
    {
      this.emit("deltas", msg, msg.clientId === this.socket.id);
      msg = this.queue.dequeue();
    }
  }

  pause() 
  {
    this.paused = true;
  }

  submitOps(delta: IDocumentDelta)
  {
    this.socket.emit("submitOps", this.documentId, delta);
  }
}