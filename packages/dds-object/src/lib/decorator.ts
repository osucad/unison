import 'reflect-metadata';
import { DDSProperty, PropertyMetadata } from './DDSProperty.js';

const metadataKey = Symbol('ObjectDDS.properties');

export function property(): PropertyDecorator 
{
  return (target, propertyKey) => 
  {
    if (typeof propertyKey !== 'string')
      throw new Error("Property keys must be strings");

    const properties = getPropertyMetadata(target);

    const property = new DDSProperty(propertyKey);

    Reflect.defineMetadata(metadataKey, properties.with(property), target);
  };
}

export function getPropertyMetadata(target: any): PropertyMetadata 
{
  return Reflect.getMetadata(metadataKey, target) ?? new PropertyMetadata([]);
}