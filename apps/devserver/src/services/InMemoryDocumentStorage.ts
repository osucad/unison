import { IDocumentSummary } from "@unison/shared-definitions";
import { randomUUID } from "node:crypto";
import { IDocumentStorage } from "./IDocumentStorage";

export class InMemoryDocumentStorage implements IDocumentStorage 
{
  private readonly summaries = new Map<string, IDocumentSummary[]>();

  async getSummary(documentId: string, sequenceNumber: number | "latest"): Promise<IDocumentSummary | null> 
  {
    const summaries = this.getSummaries(documentId);

    if (sequenceNumber === "latest")
      return summaries[summaries.length - 1] ?? null;

    return summaries.find(it => it.sequenceNumber === sequenceNumber) ?? null;
  }

  async appendSummary(documentId: string, summary: IDocumentSummary): Promise<void> 
  {
    this.getSummaries(documentId).push(summary);
  }

  async createDocument(summary: Omit<IDocumentSummary, "sequenceNumber">): Promise<string> 
  {
    const documentId = randomUUID();

    this.summaries.set(documentId, [{ ...summary, sequenceNumber: 0 }]);

    return documentId;
  }

  private getSummaries(documentId: string): IDocumentSummary[] 
  {
    let summaries = this.summaries.get(documentId);
    if (summaries === undefined)
      this.summaries
        .set(documentId, summaries = []);

    return summaries;
  }
}