import { IDocumentSummary } from "./summary.js";

export interface IDocumentStorageService 
{
  getSummary(
    documentId: string,
    sequenceNumber: number | "latest",
  ): Promise<IDocumentSummary>;
}