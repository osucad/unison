import { ISequencedDocumentMessage } from "@unison/protocol";
import { IDeltaStorage } from "./IDeltaStorage";

export class InMemoryDeltaStorage implements IDeltaStorage {
  private readonly deltas = new Map<string, DeltaChannel>()

  async getDeltas(documentId: string, start: number, end?: number): Promise<ISequencedDocumentMessage[]> {
    return this.deltas.get(documentId)?.get(start, end) ?? []
  }

  async append(documentId: string, deltas: ISequencedDocumentMessage[]): Promise<void> {
    this.getChannel(documentId).append(deltas)
  }

  private getChannel(documentId: string) {
    let channel = this.deltas.get(documentId)

    if (!channel) {
      channel = new DeltaChannel()
      this.deltas.set(documentId, channel)
    }

    return channel
  }
}

class DeltaChannel {
  private deltas: ISequencedDocumentMessage[] = []

  get(first: number, last?: number) {
    if (!last)
      return this.deltas.filter(it => it.sequenceNumber >= first)

    return this.deltas.filter(it => it.sequenceNumber >= first && it.sequenceNumber <= last)
  }

  append(deltas: ISequencedDocumentMessage[]) {
    this.deltas.push(...deltas)
  }
}