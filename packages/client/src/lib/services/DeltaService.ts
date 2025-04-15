import { ISequencedDocumentMessage, ScopeTypes } from "@unison/protocol";
import { ITokenProvider } from "../auth/ITokenProvider.js";
import { IEndpointConfiguration } from "../UnisonClient.js";

export class DeltaService {
  constructor(
      private readonly endpoints: IEndpointConfiguration,
      private readonly tokenProvider: ITokenProvider
  ) {
  }

  async getDeltas(
      documentId: string,
      first: number,
      last?: number
  ) {
    const { endpoints, tokenProvider } = this

    const { token } = await tokenProvider.getToken(documentId, [ScopeTypes.Read])

    console.log(`Loading deltas [${first} - ${last}] for document ${documentId}`)

    const url = new URL(`${endpoints.api}/deltas/${documentId}`)
    url.searchParams.set('documentId', documentId)
    url.searchParams.set('first', first.toString())
    if (last !== undefined)
      url.searchParams.set('last', last.toString())

    const deltas: ISequencedDocumentMessage[] = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => res.json())

    console.log(`Loaded ${deltas.length} deltas for document ${documentId}`)
    return deltas
  }
}