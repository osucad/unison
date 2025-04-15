import { ScopeTypes } from "@unison/protocol";
import { Axios } from "axios";
import { ITokenProvider } from "../client/ITokenProvider.js";

export class DocumentStorage {
  constructor(
      private readonly documentId: string,
      private readonly axios: Axios,
      private readonly tokenProvider: ITokenProvider
  ) {
  }

  async getSummary(sequenceNumber: number | 'latest') {
    const { documentId, axios, tokenProvider } = this

    const { token } = await tokenProvider.getToken(documentId, [ScopeTypes.Read])

    const response = await axios.get(`/documents/${documentId}/summary/${sequenceNumber}`, {
      responseType: 'json',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response.data
  }
}