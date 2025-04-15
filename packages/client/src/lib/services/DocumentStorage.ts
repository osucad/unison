import { ScopeTypes } from "@unison/protocol";
import { Axios } from "axios";
import { ITokenProvider } from "../client/ITokenProvider.js";
import { ISummary } from "../client/loadContainer.js";

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

    console.log(`Loading summary for document ${documentId}`)

    const summary = await axios.get<ISummary>(`/documents/${documentId}/summary/${sequenceNumber}`, {
      responseType: 'json',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => res.data)

    console.log(`Loaded summary for document ${documentId} [sequenceNumber=${summary.sequenceNumber}]`)

    return summary
  }
}