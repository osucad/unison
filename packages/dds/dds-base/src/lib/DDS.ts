import { DDSAttributes, IDeltaChannel, IUnisonRuntime } from "@unison/client-definitions";
import { EventEmitter } from "eventemitter3";

export interface DDSEvents 
{
  attach(): void;

  detach(): void;
}

export abstract class DDS extends EventEmitter<DDSEvents> 
{
  protected constructor(readonly attributes: DDSAttributes) 
  {
    super();
  }

  private _id: string | null = null;
  private _runtime?: IUnisonRuntime;

  public get id(): string | null 
  {
    return this._id;
  }

  public get isAttached() 
  {
    return !!this._runtime;
  }

  public attach(id: string, runtime: IUnisonRuntime, deltas: IDeltaChannel)
  {
    if (this.isAttached)
      throw new Error("Already attached");

    this._id = id;
    this._runtime = runtime;

    this.attachToDeltaChannel(deltas);

    this.emit("attach");
  }

  protected abstract attachToDeltaChannel(deltas: IDeltaChannel): void;

  public detach() 
  {
    if (!this.isAttached)
      return;

    this._id = null;
    this._runtime = undefined;
    this.emit("detach");
  }

  public abstract createSummary(): unknown;

  public abstract load(contents: unknown): void;
}