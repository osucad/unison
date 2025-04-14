import { ISequencedDocumentMessage } from "./protocol";

export interface ServerMessages {
  deltas(documentId: string, message: ISequencedDocumentMessage[]): void
}

