import { normalizeDocumentSchema } from "./lib/client/DocumentSchema.js";
import { InsecureTokenProvider } from "./lib/client/InsecureTokenProvider.js";
import { UnisonClient } from "./lib/client/UnisonClient.js";
import { Counter } from "./lib/dds/counter/Counter.js";
import { normalizeDDSFactory } from "./lib/dds/DDSFactory.js";
import { DDSTypeRegistry } from "./lib/runtime/DDSTypeRegistry.js";
import { UnisonRuntime } from "./lib/runtime/UnisonRuntime.js";

const client = new UnisonClient({
  tokenProvider: new InsecureTokenProvider(),
  endpoints: {
    api: 'http://localhost:3333/api/v1',
    ordererUrl: 'ws://localhost:3333',
  }
})

const document = await client.createDocument({
  schema: {
    counter: Counter
  }
})

document.get('counter').value = 10

const summary = document.runtime.createSummary()

const runtime = new UnisonRuntime(
    normalizeDocumentSchema({ counter: Counter }),
    new DDSTypeRegistry([normalizeDDSFactory(Counter)]),
    summary
)

console.log(runtime)