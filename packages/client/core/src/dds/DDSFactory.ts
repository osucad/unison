import { DDS, DDSAttributes } from "./DDS.js";

export interface DDSFactory<out T extends DDS = DDS>
{
  readonly Attributes: DDSAttributes;

  new(): T;
}