import { ISequencedDocumentMessage, ISummaryTree } from "@unison/shared-definitions";
import { IChannelStorage, readAndParse } from "../IChannelStorage.js";
import { SharedStructure } from "../SharedStructure.js";

export interface IRegisterSetMessage {
  type: 'set',
  value: unknown;
}

export interface IRegisterSummary {
  value: string;
}

export class Register<T> extends SharedStructure {
  #value: T;

  get value() {
    return this.#value;
  }

  set value(value) {
    const previousValue = this.#set(value);

    const op: IRegisterSetMessage = {
      type: 'set',
      value: value
    }

    const undoOp: IRegisterSetMessage = {
      type: 'set',
      value: previousValue
    }

    const messageId = ++this.#messageId;

    this.submitLocalOp(op, undoOp, messageId)
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

  protected override async loadFromSummary(storage: IChannelStorage): Promise<void> {
    const content = await readAndParse<IRegisterSummary>(storage, 'head')

    this.#value = JSON.parse(content.value);
  }

  async summarize(): Promise<ISummaryTree> {
    const summary: IRegisterSummary = {
      value: JSON.stringify(this.#value)
    }

    return {
      type: 'tree',
      tree: {
        head: {
          type: 'blob',
          content: JSON.stringify(summary),
          encoding: 'utf-8'
        }
      }
    }
  }

  #set(value: T) {
    const previousValue = this.#value;
    this.#value = value;
    return previousValue;
  }
}