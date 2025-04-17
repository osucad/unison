import { DDS, DDSClass, DDSFactory, DDSFactoryOrClass, normalizeDDSFactory } from "@unison/dds-base";

export type DocumentSchema = Record<string, DDSFactoryOrClass>;

export type DocumentEntrypoint = Record<string, DDS>;

export type UnwrapDocumentSchema<T extends DocumentSchema> = {
  [K in keyof T]: UnwrapDDSFactory<T[K]>
};

export type UnwrapDDSFactory<T extends DDSFactoryOrClass> =
    T extends DDSFactory<infer U> ? U
      : T extends DDSClass<infer U> ? U
        : never;

export function normalizeDocumentSchema(schema: DocumentSchema): Record<string, DDSFactory> 
{
  const objects: Record<string, DDSFactory> = {};

  for (const key in schema)
    objects[key] = normalizeDDSFactory(schema[key]);

  return objects;
}