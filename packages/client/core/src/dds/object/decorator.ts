import "reflect-metadata";
import { ObjectMetadata } from "./ObjectMetadata.js";
import { Property } from "./Property.js";

const metadataKey = Symbol("ObjectDDS.properties");

export function property(): PropertyDecorator
{
  return (target, propertyKey) =>
  {
    if (typeof propertyKey !== "string")
      throw new Error("Only string keys are supported");

    const metadata = getObjectMetadata(target);

    const property = new Property(propertyKey);

    Reflect.defineMetadata(metadataKey, metadata.withProperty(property), target);
  };
}

export function getObjectMetadata(target: any): ObjectMetadata
{
  return Reflect.getMetadata(metadataKey, target) ?? new ObjectMetadata([]);
}