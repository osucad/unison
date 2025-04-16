import { ObjectDDS } from "./ObjectDDS.js";
import { getPropertyMetadata } from "./decorator.js";
import { PropertyMetadata } from "./DDSProperty.js";

export type IObjectDDSSummary = Record<string, unknown>

/**
 * @internal
 */
export class ObjectDDSKernel {
  private readonly target: ObjectDDS
  private readonly metadata: PropertyMetadata

  constructor(target: ObjectDDS,) {
    this.target = target
    this.metadata = getPropertyMetadata(target)
  }

  createSummary(): IObjectDDSSummary {
    const { target, metadata } = this

    const summary = {} as IObjectDDSSummary

    for (const property of metadata.properties) {
      const value = Reflect.get(target, property.key)

      summary[property.key] = property.encode(value)
    }

    return summary
  }

  load(summary: IObjectDDSSummary) {
    const { target, metadata } = this

    for (const key in summary) {
      const property = metadata.get(key)
      if (!property) {
        console.warn(`Unknown property "${key}" in summary`)
        continue
      }

      const value = property.decode(summary[key])

      Reflect.set(target, key, value)
    }
  }
}