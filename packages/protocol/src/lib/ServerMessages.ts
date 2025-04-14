import { ISequencedDocumentMessage } from "./ISequencedDocumentMessage";

export interface ServerMessages {
  deltas(message: ISequencedDocumentMessage): void
}

