import { ClientMessages, PROTOCOL_VERSION, ScopeTypes, ServerMessages } from "@unison/protocol";
import { io, Socket } from "socket.io-client";
import { ITokenProvider } from "./auth/ITokenProvider.js";
import { catchUpWithDeltaStream } from "./CatchupMonitor.js";
import { GetDocumentOptions, IEndpointConfiguration } from "./UnisonClient.js";
import { createTimeout } from "./util/timeout.js";

export class ContainerLoader {
  constructor(
      readonly endpoints: IEndpointConfiguration,
      readonly tokenProvider: ITokenProvider
  ) {
  }

  async load(documentId: string, options: GetDocumentOptions) {
    const scopes = options.readonly
        ? [ScopeTypes.Read]
        : [ScopeTypes.Read, ScopeTypes.Write]

    const { token } = await this.tokenProvider.getToken(documentId, scopes)

    const connection: Socket<ServerMessages, ClientMessages> = io(this.endpoints.ordererUrl, {
      transports: ['websocket'],
      multiplex: true,
    })

    await waitForConnected(connection)

    const response = await connection.emitWithAck('connectDocument', {
      documentId,
      token,
      version: PROTOCOL_VERSION
    })

    if (!response.success)
      throw new Error("Failed to connect to document", { cause: response })

    const catchUpResult = await catchUpWithDeltaStream(documentId, connection, createTimeout(10_000))
    console.log(catchUpResult)
  }
}

async function waitForConnected(connection: Socket) {
  await new Promise<void>((resolve, reject) => {
    connection.once('connect', resolve)
    connection.once('connect_error', reject)
  })
}