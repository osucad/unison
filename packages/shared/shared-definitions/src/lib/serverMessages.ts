import { ISequencedDocumentMessage } from "./protocol.js";

export interface ServerMessages 
{
  deltas(documentId: string, deltas: ISequencedDocumentMessage[]): void;
}

