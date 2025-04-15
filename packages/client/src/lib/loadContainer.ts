import { ClientMessages, ISequencedDocumentMessage, PROTOCOL_VERSION, ScopeTypes, ServerMessages } from "@unison/protocol";
import { io, Socket } from "socket.io-client";
import { ITokenProvider } from "./auth/ITokenProvider.js";
import { catchUpWithDeltaStream } from "./catchUpWithDeltaStream.js";
import { GetDocumentOptions, IEndpointConfiguration } from "./UnisonClient.js";
import { createTimeout } from "./util/timeout.js";

export async function loadContainer(
    documentId: string,
    options: GetDocumentOptions,
    endpoints: IEndpointConfiguration,
    tokenProvider: ITokenProvider,
) {
  console.log(`Loading container for document ${documentId}`)

  const scopes = options.readonly
      ? [ScopeTypes.Read]
      : [ScopeTypes.Read, ScopeTypes.Write]

  const { token } = await tokenProvider.getToken(documentId, scopes)

  const connection: Socket<ServerMessages, ClientMessages> = io(endpoints.ordererUrl, {
    transports: ['websocket'],
    multiplex: true,
  })

  await waitForConnected(connection)

  console.log('Established websocket connection')

  const response = await connection.emitWithAck('connectDocument', {
    documentId,
    token,
    version: PROTOCOL_VERSION
  })

  console.log('Connected to delta stream')

  if (!response.success)
    throw new Error(`Failed to connect to document: ${response.error}`)

  const summary = loadSummary(documentId, endpoints)

  const catchUpResult = await catchUpWithDeltaStream(
      documentId,
      connection,
      summary,
      (documentId, first, last) => loadDeltas(documentId, endpoints, first, last),
      createTimeout(10_000)
  )

  console.log(catchUpResult)
}

async function waitForConnected(connection: Socket) {
  await new Promise<void>((resolve, reject) => {
    connection.once('connect', resolve)
    connection.once('connect_error', reject)
  })
}

export interface ISummary {
  sequenceNumber: number
  contents: unknown
}

async function loadSummary(
    documentId: string,
    endpoints: IEndpointConfiguration
): Promise<ISummary> {
  console.log(`Loading summary for document ${documentId}`)

  const summary: ISummary = await fetch(`${endpoints.api}/documents/${documentId}/summary/latest`).then(res => res.json())

  console.log(`Loaded summary for document ${documentId} [sequenceNumber=${summary.sequenceNumber}]`)
  return summary
}

async function loadDeltas(
    documentId: string,
    endpoints: IEndpointConfiguration,
    first: number,
    last: number,
): Promise<ISequencedDocumentMessage[]> {
  console.log(`Loading deltas [${first} - ${last}] for document ${documentId}`)

  const url = new URL(`${endpoints.api}/deltas/${documentId}`)
  url.searchParams.set('documentId', documentId)
  url.searchParams.set('first', first.toString())
  url.searchParams.set('last', last.toString())

  const deltas: ISequencedDocumentMessage[] = await fetch(url).then(res => res.json())

  console.log(`Loaded ${deltas.length} deltas for document ${documentId}`)
  return deltas
}