import { ITokenProvider } from "./auth/ITokenProvider.js";
import { IEndpointConfiguration } from "./UnisonClient.js";
import { io } from "socket.io-client";

export class ContainerLoader {
  constructor(
      readonly endpoints: IEndpointConfiguration,
      readonly tokenProvider: ITokenProvider
  ) {
  }

  async load() {
    const connection = io(this.endpoints.ordererUrl, {
      transports: ['websocket'],
      multiplex: true,
    })

    await new Promise<void>((resolve, reject) => {
      connection.once('connect', resolve)
      connection.once('connect_error', reject)
    })
  }
}