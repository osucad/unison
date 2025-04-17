export class DDSProperty<T = unknown> 
{
  constructor(
    readonly key: string,
  ) 
  {
  }

  encode(value: T): unknown 
  {
    return value;
  }

  decode(value: unknown): T 
  {
    return value as T;
  }
}

export class PropertyMetadata 
{
  private readonly propertyMap: Map<string, DDSProperty>;

  constructor(readonly properties: readonly DDSProperty[]) 
  {
    this.propertyMap = new Map(properties.map(it => [it.key, it]));
  }

  with(property: DDSProperty) 
  {
    return new PropertyMetadata([...this.properties, property]);
  }

  get(key: string) 
  {
    return this.propertyMap.get(key);
  }
}