import { EventEmitter } from "eventemitter3";
import { UnisonRuntime } from "../runtime/UnisonRuntime.js";
import { DDSAttributes } from "@unison/client-definitions";

export interface DDSEvents {
  attach(): void;

  detach(): void;
}

export abstract class DDS extends EventEmitter<DDSEvents> {
  protected constructor(
      readonly attributes: DDSAttributes,
  ) {
    super();
  }

  private _id: string | null = null;
  private _runtime?: UnisonRuntime;

  get id(): string | null {
    return this._id;
  }

  attach(id: string, runtime: UnisonRuntime) {
    if (this.isAttached)
      throw new Error("Already attached");

    this._id = id;
    this._runtime = runtime;
    this.emit('attach');
  }

  detach() {
    if (!this.isAttached)
      return;

    this._id = null;
    this._runtime = undefined;
    this.emit('detach');
  }

  get isAttached() {
    return !!this._runtime;
  }

  abstract createSummary(): unknown;

  abstract load(contents: unknown): void;
}
