import { ISequencedDocumentMessage } from "@unison/protocol";

export interface IDeltaStorage 
{
  getDeltas(documentId: string, first: number, last?: number): Promise<ISequencedDocumentMessage[]>;

  append(documentId: string, deltas: ISequencedDocumentMessage[]): Promise<void>;
}