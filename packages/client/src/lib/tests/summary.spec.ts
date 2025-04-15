import { describe, expect, it } from "vitest";
import { normalizeDocumentSchema } from "../client/DocumentSchema.js";
import { Counter } from "../dds/counter/Counter.js";
import { normalizeDDSFactory } from "../dds/DDSFactory.js";
import { DDSTypeRegistry } from "../runtime/DDSTypeRegistry.js";
import { UnisonRuntime } from "../runtime/UnisonRuntime.js";

describe("Summary", () => {
  it("creates & loads from summary", () => {
    const runtime1 = new UnisonRuntime(
        normalizeDocumentSchema({ counter: Counter }),
        new DDSTypeRegistry([normalizeDDSFactory(Counter)]),
    );

    (runtime1.rootObjects.counter as Counter).value = 105;

    const summary = runtime1.createSummary()

    const runtime2 = new UnisonRuntime(
        normalizeDocumentSchema({ counter: Counter }),
        new DDSTypeRegistry([normalizeDDSFactory(Counter)]),
        summary,
    )

    const counter1 = runtime1.rootObjects.counter as Counter
    const counter2 = runtime2.rootObjects.counter as Counter

    expect(counter1.id).toBeTypeOf('string')
    expect(counter2.id).toBeTypeOf('string')
    expect(counter1.id).toBe(counter2.id)

    expect(counter1).toBeInstanceOf(Counter)
    expect(counter2).toBeInstanceOf(Counter)

    expect(counter1.value).toBe(counter2.value)
  })
})