import { DDS } from "src/dds/DDS.js";
import { EncodedHandle, EncodedValue, IDecoder, ValueType } from "../serialization/index.js";
import { nn } from "../utils/nn.js";
import { DocumentRuntime } from "./DocumentRuntime.js";

export class OpDecoder implements IDecoder 
{
  constructor(readonly runtime: DocumentRuntime) 
  {
  }

  readonly objects = new Map<string, DDS>;

  decode(value: EncodedValue): unknown 
  {
    switch (value[0]) 
    {
      case ValueType.Plain:
        return value[1];
      case ValueType.DDS:
        return this.decodeHandle(value);
    }
  }

  decodeHandle<T extends DDS>(handle: EncodedHandle): T 
  {
    const [, id] = handle;

    return nn(
      this.objects.get(id) ??
        this.runtime.getObject(id)
    ) as T;
  }
}