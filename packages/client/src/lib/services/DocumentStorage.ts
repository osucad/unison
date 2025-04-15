import { ScopeTypes } from "@unison/protocol";
import { ITokenProvider } from "../client/ITokenProvider.js";
import { ISummary } from "../client/loadContainer.js";
import { IEndpointConfiguration } from "../client/UnisonClient.js";

export class DocumentStorage {
  constructor(
      private readonly endpoints: IEndpointConfiguration,
      private readonly tokenProvider: ITokenProvider
  ) {
  }

  async getSummary(documentId: string, sequenceNumber: number | 'latest') {
    const { endpoints, tokenProvider } = this

    const { token } = await tokenProvider.getToken(documentId, [ScopeTypes.Read])

    console.log(`Loading summary for document ${documentId}`)

    const summary: ISummary = await fetch(`${endpoints.api}/documents/${documentId}/summary/latest`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
    }).then(res => res.json())

    console.log(`Loaded summary for document ${documentId} [sequenceNumber=${summary.sequenceNumber}]`)
    return summary
  }
}