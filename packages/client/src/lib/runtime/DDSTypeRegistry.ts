import { DDSAttributes } from "../dds/DDS.js";
import { DDSFactory } from "../dds/DDSFactory.js";

export class DDSTypeRegistry {
  private readonly registry = new Map<string, DDSFactory>()

  constructor(
      factories: readonly DDSFactory[]
  ) {
    for (const factory of factories)
      this.registry.set(factory.attributes.type, factory)
  }

  resolve(attributes: DDSAttributes) {
    return this.registry.get(attributes.type)
  }
}