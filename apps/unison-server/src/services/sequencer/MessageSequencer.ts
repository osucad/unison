import { DocumentOperation, IClientLeave, ISequencedDocumentMessage, MessageType, ScopeTypes } from "@unison/protocol";
import { ClientManager } from "../../multiplayer/ClientManager";
import { IProducer } from "../../multiplayer/IProducer";

export interface RawOperationMessage {
  readonly clientId: string | null
  readonly timestamp: number
  readonly operation: DocumentOperation
}

export class MessageSequencer {
  constructor(
      readonly documentId: string,
      readonly deltasProducer: IProducer<ISequencedDocumentMessage>
  ) {
  }

  private readonly clientManager = new ClientManager()

  private sequenceNumber = 0

  process(message: RawOperationMessage) {
    const operation = message.operation

    if (operation.type === MessageType.ClientJoin) {


      const isNewClient = this.clientManager.upsertClient(
          operation.contents.clientId,
          operation.clientSequenceNumber,
          operation.contents.detail.scopes,
      )

      if (!isNewClient)
        return
    }

    if (message.operation.type === MessageType.ClientLeave) {
      const leaveInfo = message.operation as IClientLeave

      if (!this.clientManager.removeClient(leaveInfo.contents.clientId))
        return;
    }

    if (message.operation.type === MessageType.Operation) {
      if (!message.clientId)
        return

      this.clientManager.upsertClient(
          message.clientId,
          operation.clientSequenceNumber,
      )

      const client = this.clientManager.get(message.clientId)

      if (!client || !client.scopes.includes(ScopeTypes.Write)) {
        // TODO: Add way to send nack messages
        return;
      }
    }

    const sequenceNumber = this.nextSequenceNumber()

    const msg: ISequencedDocumentMessage = {
      clientId: message.clientId,
      clientSequenceNumber: message.operation.clientSequenceNumber,
      contents: message.operation.contents,
      sequenceNumber,
      type: message.operation.type,
    }

    this.deltasProducer.send([msg])
  }

  private nextSequenceNumber() {
    return ++this.sequenceNumber
  }
}