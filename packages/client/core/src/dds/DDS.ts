import { IDecoder, IEncoder } from "src/serialization/index.js";
import { DDSContext } from "./DDSContext.js";
import { EventEmitter } from "eventemitter3";

export interface DDSEvents 
{
  attach(): void;
  detach(): void;
}

export abstract class DDS<TEvents extends DDSEvents = any> extends EventEmitter<TEvents>
{
  protected constructor(readonly attributes: DDSAttributes)
  {
    super();
  }

  private _context: DDSContext | null = null;

  public isAttached()
  {
    return this._context !== null;
  }

  get id() 
  {
    return this._context?.id;
  }

  protected get runtime() 
  {
    return this._context?.runtime;
  }

  public attach(context: DDSContext)
  {
    this._context = context;
  }

  public detach()
  {
    this._context = null;
  }

  abstract createSummary(encoder: IEncoder): unknown;

  abstract load(summary: unknown, decoder: IDecoder): void;

  public abstract process(contents: unknown, local: boolean, decoder: IDecoder): void;
}

export interface DDSAttributes
{
  readonly type: string;
}