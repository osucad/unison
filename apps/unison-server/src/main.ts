import { createApp } from "./app";
import { InMemoryDeltaStorage } from "./services/InMemoryDeltaStorage";
import { InsecureTokenVerifier } from "./services/InsecureTokenVerifier";
import { IUnisonServerResources } from "./services/IUnisonServerResources";
import { OrdererService } from "./services/sequencer/OrdererService";

async function main() {
  const resources: IUnisonServerResources = {
    ordererService: new OrdererService(),
    tokenVerifier: new InsecureTokenVerifier(),
    deltaStorage: new InMemoryDeltaStorage(),
  }

  const app = await createApp(resources)

  const port = process.env.PORT || 3333;

  const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
  })

  server.on('error', console.error);
}

main().then()