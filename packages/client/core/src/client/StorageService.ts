import { IDocumentSummary } from "../runtime/index.js";
import { TokenProvider } from "./TokenProvider.js";

export class StorageService
{
  constructor(
    readonly endpoint: string,
    private readonly tokenProvider: TokenProvider,
  )
  {
  }

  async createDocument(summary: IDocumentSummary): Promise<{ id: string }>
  {
    const { token } = await this.tokenProvider.getToken();

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
    const { token } = await this.tokenProvider.getToken(documentId);

    const response = await fetch(`${this.endpoint}/documents/${documentId}/summary/${sequenceNumber}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      },
    });

    return response.json();
  }
}