import { ISequencedDocumentMessage } from "./protocol";

export interface ServerMessages {
  deltas(documentId: string, deltas: ISequencedDocumentMessage[]): void
}

