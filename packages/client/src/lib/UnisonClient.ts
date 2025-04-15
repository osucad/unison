import { ITokenProvider } from "./auth/ITokenProvider.js";
import { loadContainer } from "./loadContainer.js";

export interface IUnisonClientOptions {
  tokenProvider: ITokenProvider
  endpoints: IEndpointConfiguration
}

export interface IEndpointConfiguration {
  api: string
  ordererUrl: string
}

export interface GetDocumentOptions {
  readonly?: boolean
}

export class UnisonClient {
  constructor(options: IUnisonClientOptions) {
    this.tokenProvider = options.tokenProvider
    this.endpoints = options.endpoints
  }

  private readonly tokenProvider: ITokenProvider
  private readonly endpoints: IEndpointConfiguration

  async getDocument(documentId: string, options: GetDocumentOptions = {}) {
    await loadContainer(
        documentId,
        options,
        this.endpoints,
        this.tokenProvider,
    )
  }
}
