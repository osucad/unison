import { IDocumentSummary } from "../runtime/index.js";
import { ITokenProvider } from "./ITokenProvider.js";
import { ScopeTypes } from "@unison/shared-definitions";

export class StorageService
{
  constructor(
    readonly endpoint: string,
    private readonly tokenProvider: ITokenProvider,
  )
  {
  }

  async createDocument(summary: IDocumentSummary): Promise<{ id: string }>
  {
    const { token } = await this.tokenProvider.getToken(undefined, [ScopeTypes.Create]);

    const response = await fetch(`${this.endpoint}/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ summary })
    });

    return response.json();
  }

  async getSummary(documentId: string, sequenceNumber: number | "latest" = "latest"): Promise<IDocumentSummary>
  {
    const { token } = await this.tokenProvider.getToken(documentId, [ScopeTypes.Read]);

    const response = await fetch(`${this.endpoint}/documents/${documentId}/summary/${sequenceNumber}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      },
    });

    return response.json();
  }
}