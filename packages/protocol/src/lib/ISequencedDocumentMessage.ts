import { IDocumentOperation } from "./IDocumentOperation";

export interface ISequencedDocumentMessage {
  readonly clientId?: string
  readonly sequenceNumber: number
  readonly clientSequenceNumber: number
  readonly operation: IDocumentOperation
}