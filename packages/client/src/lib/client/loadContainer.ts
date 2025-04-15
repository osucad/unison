import { ClientMessages, PROTOCOL_VERSION, ScopeTypes, ServerMessages } from "@unison/protocol";
import { io, Socket } from "socket.io-client";
import { catchUpWithDeltaStream } from "./catchUpWithDeltaStream.js";
import { Container } from "../container/Container.js";
import { DeltaStream } from "../container/DeltaStream.js";
import { IContainerServices } from "../container/IContainerServices.js";
import { UnisonRuntime } from "../container/UnisonRuntime.js";
import { Audience } from "../services/Audience.js";
import { DeltaService } from "../services/DeltaService.js";
import { DocumentStorage } from "../services/DocumentStorage.js";
import { createTimeout } from "../util/timeout.js";
import { ITokenProvider } from "./ITokenProvider.js";
import { GetDocumentOptions, IEndpointConfiguration } from "./UnisonClient.js";

export async function loadContainer(
    documentId: string,
    options: GetDocumentOptions,
    endpoints: IEndpointConfiguration,
    tokenProvider: ITokenProvider,
): Promise<{ container: Container, services: IContainerServices }> {
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

  const documentStorage = new DocumentStorage(documentId, endpoints, tokenProvider)
  const deltaService = new DeltaService(documentId, endpoints, tokenProvider)

  const summary = documentStorage.getSummary('latest')

  const catchUpResult = await catchUpWithDeltaStream(
      documentId,
      connection,
      summary,
      deltaService,
      createTimeout(10_000)
  )

  const runtime = new UnisonRuntime(catchUpResult.summary)

  const deltaStream = new DeltaStream(documentId, connection)

  const audience = new Audience(catchUpResult.summary, deltaStream)

  const container = new Container(
      runtime,
      deltaStream,
  )

  deltaStream.catchUp(catchUpResult.deltas)

  return {
    container,
    services: {
      storage: documentStorage,
      audience,
    }
  }
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
