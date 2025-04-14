import { ClientMessages, PROTOCOL_VERSION, ScopeTypes, ServerMessages } from "@unison/protocol";
import { ITokenProvider } from "./auth/ITokenProvider.js";
import { GetDocumentOptions, IEndpointConfiguration } from "./UnisonClient.js";
import { io, Socket } from "socket.io-client";

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

    connection.onAny(console.log)

    await waitForConnected(connection)

    const response = await connection.emitWithAck('connectDocument', {
      documentId,
      token,
      version: PROTOCOL_VERSION
    })

    if (!response.success)
      throw new Error("Failed to connect to document", { cause: response })
  }
}

async function waitForConnected(connection: Socket) {
  await new Promise<void>((resolve, reject) => {
    connection.once('connect', resolve)
    connection.once('connect_error', reject)
  })
}