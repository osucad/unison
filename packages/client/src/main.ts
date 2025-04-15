import { UnisonClient } from "./lib/client/UnisonClient.js";
import { InsecureTokenProvider } from "./lib/client/InsecureTokenProvider.js";


const client = new UnisonClient({
  tokenProvider: new InsecureTokenProvider(),
  endpoints: {
    api: 'http://localhost:3333/api/v1',
    ordererUrl: 'ws://localhost:3333',
  }
})

client.getDocument('15a33aae-b00b-414d-8a39-f8b32ce50b41')