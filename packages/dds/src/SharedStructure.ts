import { ISequencedDocumentMessage, ISummaryTree } from '@unison/shared-definitions'
import { IChannelServices } from "./IChannelServices.js";
import { IChannelStorage } from "./IChannelStorage.js";

export abstract class SharedStructure {
  #services?: IChannelServices;
  #id?: string;

  get id() {
    return this.#id;
  }

  get isAttached() {
    return this.#services !== undefined;
  }

  attach(
      id: string,
      services: IChannelServices
  ) {
    this.#id = id;
    this.#services = services;
    this.#attachDeltaConnection();
  }

  async load(
      id: string,
      services: IChannelServices
  ) {
    this.#id = id;
    this.#services = services;
    await this.loadFromSummary(services.storage);
    this.#attachDeltaConnection();
  }

  protected abstract loadFromSummary(storage: IChannelStorage): Promise<void>;

  abstract summarize(): Promise<ISummaryTree>;

  #attachDeltaConnection() {
    this.#services!.deltas.attach({
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
    this.#services?.deltas.submitOp(op, undoOp, localOpMetadata);
  }
}