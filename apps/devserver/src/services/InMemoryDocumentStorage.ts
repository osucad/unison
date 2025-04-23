import { DocumentSummary } from "@unison/shared-definitions";
import { randomUUID } from "node:crypto";
import { IDocumentStorage } from "./IDocumentStorage";

export class InMemoryDocumentStorage implements IDocumentStorage 
{
  private readonly summaries = new Map<string, DocumentSummary[]>();

  async getSummary(documentId: string, sequenceNumber: number | "latest"): Promise<DocumentSummary | null>
  {
    const summaries = this.getSummaries(documentId);

    if (sequenceNumber === "latest")
      return summaries[summaries.length - 1] ?? null;

    return summaries.find(it => it.sequenceNumber === sequenceNumber) ?? null;
  }

  async appendSummary(documentId: string, summary: DocumentSummary): Promise<void>
  {
    this.getSummaries(documentId).push(summary);
  }

  async createDocument(summary: Omit<DocumentSummary, "sequenceNumber">): Promise<string>
  {
    const documentId = randomUUID();

    this.summaries.set(documentId, [{ ...summary, sequenceNumber: 0 }]);

    return documentId;
  }

  private getSummaries(documentId: string): DocumentSummary[]
  {
    let summaries = this.summaries.get(documentId);
    if (summaries === undefined)
      this.summaries
        .set(documentId, summaries = []);

    return summaries;
  }
}