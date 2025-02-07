import { ISequencedDocumentMessage } from "@unison/shared-definitions";
import { SharedStructure } from "../SharedStructure.js";

export interface IRegisterSetMessage {
  type: 'set',
  value: unknown;
}

export class Register<T> extends SharedStructure {
  #value: T;

  get value() {
    return this.#value;
  }

  set value(value) {
    this.#value = value;
  }

  constructor(initialValue: T) {
    super();
    this.#value = initialValue;
  }

  #messageId = -1;

  #messageIdObserved = -1;
  #pendingMessageIds: number[] = [];

  override handle(message: ISequencedDocumentMessage, local: boolean, localOpMetadata: unknown): void {
    const op = message.contents as IRegisterSetMessage;
    console.assert(op.type === 'set')

    if (this.#messageId !== this.#messageIdObserved) {
      if (local) {
        const messageIdReceived = localOpMetadata as number;
        console.assert(messageIdReceived !== undefined && messageIdReceived <= this.#messageId);
        console.assert(messageIdReceived === this.#pendingMessageIds[0])
        this.#pendingMessageIds.unshift();

        this.#messageIdObserved = messageIdReceived;
      }

      return
    }

    if (!local)
      this.#value = op.value as T;
  }
}