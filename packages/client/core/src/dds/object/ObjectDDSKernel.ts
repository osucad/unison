import { EncodedValue, IDecoder, IEncoder } from "../../serialization/index.js";
import { DDSContext } from "../DDSContext.js";
import { getObjectMetadata } from "./decorator.js";
import { ObjectDDS } from "./ObjectDDS.js";
import { ObjectMetadata } from "./ObjectMetadata.js";
import { Property } from "./Property.js";

export type IObjectDDSSummary = Record<string, EncodedValue>;

export interface IObjectMessage 
{
  type: "set";
  values: Record<string, EncodedValue>;
  version: number;
}

export class ObjectDDSKernel 
{
  readonly metadata: ObjectMetadata;
  private _context: DDSContext | null = null;
  private _pendingFields = new Map<string, number>();

  constructor(readonly target: ObjectDDS,) 
  {
    this.metadata = getObjectMetadata(target);
  }

  createSummary(encoder: IEncoder): IObjectDDSSummary 
  {
    const summary: IObjectDDSSummary = {};

    const { target, metadata } = this;

    for (const p of metadata.properties) 
    {
      const value = Reflect.get(target, p.key);

      summary[p.key] = encoder.encode(value);
    }

    return summary;
  }

  public load(summary: IObjectDDSSummary, decoder: IDecoder) 
  {
    const { target, metadata } = this;

    for (const key in summary) 
    {
      const property = metadata.getProperty(key);
      if (!property)
        continue;

      const value = decoder.decode(summary[key]);

      Reflect.set(target, key, value);
    }
  }

  public attach(context: DDSContext) 
  {
    this._context = context;
  }

  public detach() 
  {
    this._context = null;
  }

  private _version = 0;

  setValue(property: Property, newValue: any) 
  {
    Reflect.set(this.target, property.key, newValue);

    this.target.emit("changed", property.key, newValue);

    if (!this._context)
      return;

    const version = ++this._version;

    this._pendingFields.set(property.key, version);

    const op: IObjectMessage = {
      type: "set",
      values: {
        [property.key]: this._context.encoder.encode(newValue)
      },
      version
    };

    this._context?.submitLocalOp(op);
  }

  private _proxy!: ObjectDDS;

  getProxy() 
  {
    this._proxy ??= new Proxy(this.target, {
      set: (target: ObjectDDS, p: string | symbol, newValue: any, receiver: any): boolean => 
      {
        if (target.isAttached()) 
        {
          const property = this.metadata.getProperty(p as string);

          if (property) 
          {
            this.setValue(property, newValue);
            return true;
          }
        }

        return Reflect.set(target, p, newValue, receiver);
      }
    });

    return this._proxy;
  }

  public process(message: IObjectMessage, local: boolean, decoder: IDecoder)
  {
    console.log("process", message, local);

    if (message.type !== "set")
      return;

    const { target, metadata } = this;

    for (const key in message.values) 
    {
      if (local) 
      {
        const version = this._pendingFields.get(key);

        if (version !== undefined && message.version >= version)
          this._pendingFields.delete(key);

        continue;
      }

      if (this._pendingFields.has(key))
        continue;

      const property = metadata.getProperty(key);
      if(!property)
        continue;

      const value = decoder.decode(message.values[key]);

      Reflect.set(target, key, value);
      target.emit("changed", key, value);
    }
  }
}