import { IDocumentSummary } from "@unison/protocol";

export interface IDocumentStorage 
{
  getSummary(documentId: string, sequenceNumber: number | "latest"): Promise<IDocumentSummary | null>;

  appendSummary(documentId: string, summary: IDocumentSummary): Promise<void>;

  createDocument(summary: Omit<IDocumentSummary, "sequenceNumber">): Promise<string>;
}