import { createApp } from "./app";
import { InMemoryDeltaStorage } from "./services/InMemoryDeltaStorage";
import { InMemoryDocumentStorage } from "./services/InMemoryDocumentStorage";
import { InsecureTokenVerifier } from "./services/InsecureTokenVerifier";
import { IUnisonServerResources } from "./services/IUnisonServerResources";
import { RoomService } from "./services/multiplayer/RoomService";

async function main() 
{
  const resources: IUnisonServerResources = {
    roomService: new RoomService(),
    tokenVerifier: new InsecureTokenVerifier(),
    deltaStorage: new InMemoryDeltaStorage(),
    documentStorage: new InMemoryDocumentStorage(),
  };

  const app = await createApp(resources);

  const port = process.env.PORT || 3333;

  const server = app.listen(port, () => 
  {
    console.log(`Listening at http://localhost:${port}`);
  });

  server.on("error", console.error);
}

main().then();