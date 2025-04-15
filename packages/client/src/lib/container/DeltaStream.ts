import { ClientMessages, ISequencedDocumentMessage, ServerMessages } from "@unison/protocol";
import { EventEmitter } from "eventemitter3";
import { Socket } from "socket.io-client";

export interface DeltaStreamEvents {
  deltasReceived(deltas: readonly ISequencedDocumentMessage[]): void
}

export class DeltaStream extends EventEmitter<DeltaStreamEvents> {
  constructor(
      readonly documentId: string,
      readonly connection: Socket<ServerMessages, ClientMessages>,
  ) {
    super()

    connection.on('deltas', (documentId, deltas) => {
      if(documentId !== this.documentId)
        return

      this.emit('deltasReceived', deltas)
    })
  }

  catchUp(deltas: readonly ISequencedDocumentMessage[]) {
    this.emit('deltasReceived', deltas)
  }
}