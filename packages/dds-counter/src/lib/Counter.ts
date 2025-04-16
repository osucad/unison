import { DDSAttributes } from "@unison/client-definitions";
import { DDS } from "@unison/dds-base";

export interface ICounterSummary {
  value: number;
}

export class Counter extends DDS {
  static readonly attributes: DDSAttributes = {
    type: '@unison/counter',
  };

  constructor() {
    super(Counter.attributes);
  }

  private _value = 0;

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
  }

  increment(amount = 1) {
    this._value += amount;
  }

  decrement(amount = 1) {
    this._value -= amount;
  }

  public override createSummary(): ICounterSummary {
    return { value: this._value };
  }

  public override load(contents: unknown) {
    const { value } = contents as ICounterSummary;

    this._value = value;
  }
}