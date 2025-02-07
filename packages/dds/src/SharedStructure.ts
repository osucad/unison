import { ISequencedDocumentMessage } from '@unison/shared-definitions'
import { IDeltaConnection } from "./IDeltaConnection.js";

export abstract class SharedStructure {
  #deltaConnection?: IDeltaConnection;
  #id?: string;

  get id() {
    return this.#id;
  }

  get isAttached() {
    return this.#deltaConnection !== undefined;
  }

  attach(
      id: string,
      deltas: IDeltaConnection
  ) {
    this.#id = id;
    this.#deltaConnection = deltas;
    this.#attachDeltaConnection();
  }

  #attachDeltaConnection() {
    this.#deltaConnection?.attach({
      handle: (message, local, localOpMetadata) =>
          this.handle(message, local, localOpMetadata)
    })
  }

  abstract handle(
      message: ISequencedDocumentMessage,
      local: boolean,
      localOpMetadata: unknown,
  ): void

  submitLocalOp(
      op: unknown,
      undoOp: unknown,
      localOpMetadata: unknown = undefined
  ) {
    this.#deltaConnection?.submitOp(op, undoOp, localOpMetadata)
  }
}