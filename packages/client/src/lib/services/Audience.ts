import { IClient, IClientJoin, IClientLeave, IDocumentSummary, MessageType } from "@unison/protocol";
import { DeltaStream } from "../container/DeltaStream.js";

export class Audience {
  constructor(
      readonly summary: IDocumentSummary,
      readonly deltaStream: DeltaStream,
  ) {
    deltaStream.on('deltasReceived', deltas => {
      for (const op of deltas) {
        switch (op.type) {
          case MessageType.ClientJoin:
            this.handleJoin(op as IClientJoin)
            break
          case MessageType.ClientLeave:
            this.handleLeave(op as IClientLeave)
            break
        }
      }
    })
  }

  readonly clients = new Map<string, IClient>()

  private handleJoin(message: IClientJoin) {
    this.clients.set(message.contents.clientId, message.contents.detail)
  }

  private handleLeave(message: IClientLeave) {
    this.clients.delete(message.contents.clientId)
  }
}