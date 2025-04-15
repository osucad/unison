import { ISequencedDocumentMessage, ScopeTypes } from "@unison/protocol";
import { Axios } from "axios";
import { ITokenProvider } from "../client/ITokenProvider.js";

export class DeltaService {
  constructor(
      private readonly documentId: string,
      private readonly axios: Axios,
      private readonly tokenProvider: ITokenProvider
  ) {
  }

  async getDeltas(
      first: number,
      last?: number
  ) {
    const { documentId, axios, tokenProvider } = this

    const { token } = await tokenProvider.getToken(documentId, [ScopeTypes.Read])

    console.log(`Loading deltas [${first} - ${last}] for document ${documentId}`)

    const deltas = await axios.get<ISequencedDocumentMessage[]>(`/deltas/${documentId}`, {
      params: {
        documentId,
        first,
        last,
      },
      responseType: 'json',
      headers: {
        Authorization: `Bearer ${token}`
      },
    }).then(res => res.data)

    console.log(`Loaded ${deltas.length} deltas for document ${documentId}`)
    return deltas
  }
}