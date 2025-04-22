import { Property } from "./Property.js";

export class ObjectMetadata 
{
  private propertyMap = new Map<string, Property>();

  constructor(readonly properties: Property[]) 
  {
    for (const p of properties)
      this.propertyMap.set(p.key, p);
  }

  withProperty(property: Property) 
  {
    return new ObjectMetadata([...this.properties, property,]);
  }

  getProperty(key: string) 
  {
    return this.propertyMap.get(key);
  }
}