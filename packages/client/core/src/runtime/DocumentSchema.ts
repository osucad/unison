import { DDSFactory } from "../dds/index.js";

export type DocumentSchema = Record<string, DDSFactory>;

export type UnwrapDocumentSchema<T extends DocumentSchema> = {
  readonly [K in keyof T]: InstanceType<T[K]>
};