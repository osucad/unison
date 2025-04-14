import { ISubmitOps } from "./IDocumentOperation";

export interface ClientMessages {
  connectDocument(
      options: ConnectDocumentOptions,
      callback: (result: ConnectDocumentResult) => void,
  ): void

  submitOps(ops: ISubmitOps): void
}

export interface ConnectDocumentOptions {
  version: string
  documentId: string
  token: string
}

export type ConnectDocumentResult = ConnectDocumentSuccess | ConnectDocumentFailure

export interface ConnectDocumentSuccess {
  success: true
}

export interface ConnectDocumentFailure {
  success: false
  error: string
}