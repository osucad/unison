export interface ISequencedDocumentMessage {
  sequenceNumber: number;
  type: string;
  contents: unknown;
}