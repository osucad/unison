import { ISequencedDocumentMessage } from "./protocol";

export interface ServerMessages {
  deltas(message: ISequencedDocumentMessage[]): void
}

