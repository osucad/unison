import { DDSAttributes } from "@unison/client-definitions";
import { DDS } from "./DDS.js";

export interface DDSFactoryBase 
{
  readonly attributes: DDSAttributes;
}

export interface DDSFactory<out T extends DDS = DDS> extends DDSFactoryBase 
{
  createInstance(): T;
}

export type DDSClass<T extends DDS = DDS> = DDSFactoryBase & (new () => T);

export type DDSFactoryOrClass<T extends DDS = DDS> = DDSFactory<T> | DDSClass<T>;

export function normalizeDDSFactory<T extends DDS>(
  factoryOrClass: DDSFactoryOrClass<T>,
): DDSFactory<T> 
{
  if (typeof factoryOrClass === 'function') 
  {
    return {
      attributes: factoryOrClass.attributes,
      createInstance: () => new factoryOrClass(),
    };
  }

  return factoryOrClass;
}