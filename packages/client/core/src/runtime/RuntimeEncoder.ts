import { DDS } from "../dds/index.js";
import { BaseEncoder, EncodedHandle, ValueType } from "../serialization/index.js";
import { nn } from "../utils/nn.js";
import { DocumentRuntime } from "./DocumentRuntime.js";

export class RuntimeEncoder extends BaseEncoder
{
  constructor(readonly runtime: DocumentRuntime) 
  {
    super();
  }

  public encodeHandle(dds: DDS): EncodedHandle 
  {
    this.runtime.ensureAttached(dds);

    return [ValueType.DDS, nn(dds.id)];
  }
}