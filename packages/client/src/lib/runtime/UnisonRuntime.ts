import { DDS } from "../dds/DDS.js";
import { DDSFactory } from "../dds/DDSFactory.js";
import { nn } from "../util/nn.js";
import { DDSTypeRegistry } from "./DDSTypeRegistry.js";
import { IDocumentSummary, IObjectSummary, IUnisonRuntime } from "@unison/client-definitions";

export class UnisonRuntime implements IUnisonRuntime {
  readonly rootObjects: Record<string, DDS> = {};

  private readonly _aliveObjects = new Map<string, DDS>();

  private readonly _typeRegistry: DDSTypeRegistry;

  constructor(
      schema: Record<string, DDSFactory>,
      ddsTypeRegistry: DDSTypeRegistry,
      summary?: IDocumentSummary,
  ) {
    this._typeRegistry = ddsTypeRegistry;


    if (summary)
      this.load(schema, summary);
    else
      this.createInitialState(schema);

    Object.freeze(this.rootObjects);
  }

  private createInitialState(schema: Record<string, DDSFactory>) {
    for (const key in schema) {
      const factory = schema[key];

      const dds = factory.createInstance();
      this.attach(dds);

      this.rootObjects[key] = dds;

    }
  }

  attach(dds: DDS) {
    if (dds.isAttached)
      return;

    const id = generateId();
    dds.attach(id, this);
    this._aliveObjects.set(id, dds);
  }

  createSummary(): IDocumentSummary {
    const rootObjects: Record<string, string> = {};
    const entries: Record<string, IObjectSummary> = {};

    for (const [id, dds] of this._aliveObjects) {
      entries[id] = {
        attributes: structuredClone(dds.attributes),
        contents: dds.createSummary(),
      };
    }

    for (const [name, dds] of Object.entries(this.rootObjects))
      rootObjects[name] = nn(dds.id);

    return {
      rootObjects,
      entries,
    };
  }

  private load(schema: Record<string, DDSFactory>, summary: IDocumentSummary) {
    for (const [key, value] of Object.entries(summary.entries)) {
      const factory = this._typeRegistry.resolve(value.attributes);
      if (!factory)
        throw new Error(`Could not resolve dds factory for type "${value.attributes.type}"`);

      this._aliveObjects.set(key, factory.createInstance());
    }

    for (const [id, dds] of this._aliveObjects.entries()) {
      dds.load(summary.entries[id].contents);
      dds.attach(id, this);
    }

    for (const [key, factory] of Object.entries(schema)) {
      const id = nn(summary.rootObjects[key], `Missing key for "${key}" root object in summary`);

      const dds = nn(this._aliveObjects.get(id), `No summary for entrypoint (id="${id}", name="${key}")`);

      console.assert(
          dds.attributes.type === factory.attributes.type,
          `Incorrect type for entrypoint "${key}" (expected="${factory.attributes.type}", actual=${dds.attributes.type})`,
      );

      this.rootObjects[key] = dds;
    }
  }
}

function generateId() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let id = '';

  for (let i = 0; i < 8; i++)
    id += characters[Math.floor(Math.random() * characters.length)];

  return id;
}