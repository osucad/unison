import { alreadyConnected, ClientMessages, MessageType, ServerMessages } from "@unison/shared-definitions";
import { Server, Socket } from "socket.io";
import { IUnisonServerResources } from "../services/IUnisonServerResources";
import { RoomConnection } from "../services/sequencer/RoomConnection";
import { connectDocument } from "./connectDocument";
import { broadcastMessages } from "./messageBroadcaster";

export function handleWebSockets(
  io: Server<ClientMessages, ServerMessages>,
  resources: IUnisonServerResources,
) 
{
  broadcastMessages(resources, io);

  io.on("connect", async client => 
  {
    handleConnection(client, resources);
  });
}

function handleConnection(
  client: Socket<ClientMessages, ServerMessages>,
  resources: IUnisonServerResources,
) 
{
  const connectionMap = new Map<string, RoomConnection>();
  const connecting = new Set<string>();

  client.on("connectDocument", async (options, callback) => 
  {
    if (connecting.has(options.documentId) || connectionMap.has(options.documentId)) 
    {
      callback(alreadyConnected(options.documentId));
      return;
    }

    try 
    {
      connecting.add(options.documentId);
      const result = await connectDocument(client, options, resources);

      if (result.isErr()) 
      {
        callback(result.error);
        return;
      }

      if (!client.connected) 
      {
        cleanupConnection(options.documentId, result.value);
        return;
      }

      const connection = result.value;

      connectionMap.set(options.documentId, connection);

      callback({ success: true });
    }
    finally 
    {
      connecting.delete(options.documentId);
    }
  });

  client.on("submitOps", (documentId, message) => 
  {
    const connection = connectionMap.get(documentId);
    if (!connection) 
    {
      client.disconnect();
      // TODO: send error response
      return;
    }

    if (message.type !== MessageType.Operation)
      return;

    connection.sendOps(message);
  });

  client.on("disconnect", () => 
  {
    for (const [documentId, connection] of [...connectionMap])
      cleanupConnection(documentId, connection);
  });

  const cleanupConnection = (documentId: string, connection: RoomConnection) =>
  {
    connectionMap.delete(documentId);
    connection.close();
  };
}