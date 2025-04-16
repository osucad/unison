import { ISequencedDocumentMessage } from "@unison/protocol";

export interface IDeltaService 
{
  getDeltas(documentId: string, start: number, end?: number): Promise<ISequencedDocumentMessage[]>;
}

export interface IDocumentDeltaService 
{
  getDeltas(start: number, end?: number): Promise<ISequencedDocumentMessage[]>;
}