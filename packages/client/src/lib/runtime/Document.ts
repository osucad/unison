import { DocumentEntrypoint } from "../client/DocumentSchema.js";
import { DDSFactory } from "../dds/DDSFactory.js";
import { DDSTypeRegistry } from "./DDSTypeRegistry.js";
import { IDocumentSummary } from "./Summary.js";
import { UnisonRuntime } from "./UnisonRuntime.js";

export interface IDocumentOptions {
  schema: Record<string, DDSFactory>
  types: readonly DDSFactory[],
}


export class Document<T extends DocumentEntrypoint = DocumentEntrypoint> {
  private _runtime!: UnisonRuntime

  get runtime() {
    return this._runtime
  }

  private async createDetached(options: IDocumentOptions) {
    this._runtime = new UnisonRuntime(
        options.schema,
        new DDSTypeRegistry(options.types),
        undefined,
    )
  }

  private async createAttached(
      options: IDocumentOptions,
      summary: IDocumentSummary,
  ) {
    this._runtime = new UnisonRuntime(
        options.schema,
        new DDSTypeRegistry(options.types),
        summary,
    )
  }

  static async createDetached(
      options: IDocumentOptions
  ) {
    const document = new Document()

    await document.createDetached(options)

    return document
  }

  static async createAttached(
      options: IDocumentOptions & { summary: IDocumentSummary }
  ) {
    const document = new Document()

    await document.createAttached(options, options.summary)

    return document
  }

  get root(): T {
    return this._runtime.rootObjects as T;
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.root[key]
  }
}