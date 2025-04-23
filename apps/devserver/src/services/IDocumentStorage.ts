import { DocumentSummary } from "@unison/shared-definitions";

export interface IDocumentStorage 
{
  getSummary(documentId: string, sequenceNumber: number | "latest"): Promise<DocumentSummary | null>;

  appendSummary(documentId: string, summary: DocumentSummary): Promise<void>;

  createDocument(summary: Omit<DocumentSummary, "sequenceNumber">): Promise<string>;
}