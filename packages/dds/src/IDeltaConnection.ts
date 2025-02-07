import { ISequencedDocumentMessage } from "@unison/shared-definitions";

export interface IDeltaConnection {
  submitOp(op: unknown, undoOp: unknown, localOpMetadata: unknown): void;

  attach(handler: IDeltaHandler): void
}

export interface IDeltaHandler {
  handle: (message: ISequencedDocumentMessage, local: boolean, localOpMetadata: unknown) => void
}