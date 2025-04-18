import { ISequencedDocumentMessage, ScopeTypes } from "@unison/shared-definitions";
import { Axios } from "axios";
import { ITokenProvider } from "../client/ITokenProvider.js";
import { IDeltaService } from "@unison/client-definitions";

export class DeltaService implements IDeltaService
{
  constructor(
    private readonly axios: Axios,
    private readonly tokenProvider: ITokenProvider
  ) 
  {
  }

  async getDeltas(documentId: string, first: number, last?: number): Promise<ISequencedDocumentMessage[]>
  {
    const { axios, tokenProvider } = this;

    const { token } = await tokenProvider.getToken(documentId, [ScopeTypes.Read]);

    const response = await axios.get<ISequencedDocumentMessage[]>(`/deltas/${documentId}`, {
      params: {
        documentId,
        first,
        last,
      },
      responseType: "json",
      headers: {
        Authorization: `Bearer ${token}`
      },
    });

    return response.data;
  }
}