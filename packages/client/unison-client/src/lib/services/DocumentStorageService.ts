import { ScopeTypes } from "@unison/shared-definitions";
import { Axios } from "axios";
import { ITokenProvider } from "../client/ITokenProvider.js";
import { IDocumentStorageService, IDocumentSummary } from "@unison/client-definitions";

export class DocumentStorageService implements IDocumentStorageService 
{
  constructor(
    private readonly documentId: string,
    private readonly axios: Axios,
    private readonly tokenProvider: ITokenProvider,
  ) 
  {
  }

  async getSummary(documentId: string, sequenceNumber: number | "latest"): Promise<IDocumentSummary> 
  {
    const { axios, tokenProvider } = this;

    const { token } = await tokenProvider.getToken(documentId, [ScopeTypes.Read]);

    const response = await axios.get<IDocumentSummary>(`/documents/${documentId}/summary/${sequenceNumber}`, {
      responseType: "json",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }
}