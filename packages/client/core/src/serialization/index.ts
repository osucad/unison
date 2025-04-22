import { DDS } from "../dds/DDS.js";

export enum ValueType 
{
  Plain = "plain",
  DDS = "dds",
}

export type EncodePlainValue = [ValueType.Plain, unknown];
export type EncodedHandle = [ValueType.DDS, string];

export type EncodedValue = EncodePlainValue | EncodedHandle;

export interface IEncoder 
{
  encode(value: unknown): EncodedValue;

  encodeHandle(dds: DDS): EncodedHandle;
}

export interface IDecoder 
{
  decode(value: EncodedValue): unknown;

  decodeHandle<T extends DDS>(handle: EncodedHandle): T;
}

export abstract class BaseEncoder implements IEncoder
{
  encode(value: unknown): EncodedValue 
  {
    if (value instanceof DDS)
      return this.encodeHandle(value);

    return this.encodePlainValue(value);
  }

  encodePlainValue(value: unknown): EncodePlainValue 
  {
    return [ValueType.Plain, value];
  }

  abstract encodeHandle(dds: DDS): EncodedHandle;
}