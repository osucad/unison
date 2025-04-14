import { MessageSequencer } from "./MessageSequencer";
import { IProducer } from "../../multiplayer/IProducer";
import { ISequencedDocumentMessage } from "@unison/protocol";
import { EventEmitter } from "eventemitter3";
import { OrdererConnection } from "./OrdererConnection";

export interface OrdererServiceEvents {
  deltasProduced: (documentId: string, deltas: ISequencedDocumentMessage[]) => void
}

export class OrdererService extends EventEmitter<OrdererServiceEvents> {
  private readonly sequencers = new Map<string, MessageSequencer>()

  getConnection(documentId: string): OrdererConnection {
    return new OrdererConnection(() => this.getSequencer(documentId))
  }

  private getSequencer(documentId: string) {
    let sequencer = this.sequencers.get(documentId)

    if (!sequencer)
      sequencer = this.createSequencer(documentId)

    return sequencer
  }

  private createSequencer(documentId: string) {
    const sequencer = new MessageSequencer(documentId, new DeltaProducer(documentId, this.onMessagesProduced))

    this.sequencers.set(documentId, sequencer)

    return sequencer
  }

  private onMessagesProduced = (messages: ISequencedDocumentMessage[], documentId: string) => {
    this.emit('deltasProduced', documentId, messages)
  }
}

export class DeltaProducer implements IProducer<ISequencedDocumentMessage> {
  constructor(
      readonly documentId: string,
      readonly onMessagesProduced: (messages: ISequencedDocumentMessage[], documentId: string) => void
  ) {
  }

  send(messages: ISequencedDocumentMessage[]): void {
    this.onMessagesProduced(messages, this.documentId)
  }
}