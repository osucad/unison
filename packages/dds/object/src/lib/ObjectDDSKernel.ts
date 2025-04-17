import { ObjectDDS } from "./ObjectDDS.js";
import { getPropertyMetadata } from "./decorator.js";
import { DDSProperty, PropertyMetadata } from "./DDSProperty.js";

export type IObjectDDSSummary = Record<string, unknown>;

/**
 * @internal
 */
export class ObjectDDSKernel 
{
  private readonly target: ObjectDDS;
  readonly metadata: PropertyMetadata;

  private readonly pendingPropertyMap = new Map<string, number>();
  private version = 0;

  constructor(target: ObjectDDS) 
  {
    this.target = target;
    this.metadata = getPropertyMetadata(target);
  }

  createSummary(): IObjectDDSSummary 
  {
    const { target, metadata } = this;

    const summary = {} as IObjectDDSSummary;

    for (const property of metadata.properties) 
    {
      const value = Reflect.get(target, property.key);

      summary[property.key] = property.encode(value);
    }

    return summary;
  }

  load(summary: IObjectDDSSummary): void 
  {
    const { target, metadata } = this;

    for (const key in summary) 
    {
      const property = metadata.get(key);
      if (!property) 
      {
        console.warn(`Unknown property "${key}" in summary`);
        continue;
      }

      const value = property.decode(summary[key]);

      Reflect.set(target, key, value);
    }
  }

  setValue(property: DDSProperty, newValue: unknown): void 
  {
    Reflect.set(this.target, property.key, newValue);

    if (this.isAttached) 
    {
      const version = ++this.version;

      this.pendingPropertyMap.set(property.key, version);
    }
  }

  getPendingState(propertyKey: string): boolean 
  {
    return this.pendingPropertyMap.has(propertyKey);
  }

  get isAttached(): boolean 
  {
    return this.target.isAttached;
  }
}