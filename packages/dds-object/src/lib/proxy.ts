import { ObjectDDS } from "./ObjectDDS.js";

export function toProxy(dds: ObjectDDS) 
{
  return new Proxy(dds, {
    set(target: ObjectDDS, p: string | symbol, newValue: any, receiver: any): boolean 
    {
      const property = target.kernel.metadata.get(p as string);

      if (property) 
      {
        target.kernel.setValue(property, newValue);

        return true;
      }

      return Reflect.set(target, p, newValue, receiver);
    }
  });
}