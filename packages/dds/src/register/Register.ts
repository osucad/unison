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

  override handle(message: ISequencedDocumentMessage, local: boolean): void {
    const op = message.contents as IRegisterSetMessage;

    console.assert(op.type === 'set')

    this.#value = op.value as T;
  }
}