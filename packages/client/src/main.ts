import { UnisonClient } from "./lib/UnisonClient.js";
import { InsecureTokenProvider } from "./lib/auth/InsecureTokenProvider.js";


const client = new UnisonClient({
  tokenProvider: new InsecureTokenProvider(),
  endpoints: {
    ordererUrl: 'ws://localhost:3333',
  }
})

client.getDocument('documentId')