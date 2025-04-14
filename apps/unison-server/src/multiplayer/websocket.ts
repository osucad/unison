import { Server, Socket } from "socket.io";
import { alreadyConnected, ClientMessages, MessageType, ServerMessages } from "@unison/protocol";
import { connectDocument } from "./connectDocument";
import { IUnisonServerResources } from "../services/IUnisonServerResources";
import { OrdererConnection } from "../services/sequencer/OrdererConnection";
import { broadcastMessages } from "./messageBroadcaster";

export function handleWebSockets(
    io: Server<ClientMessages, ServerMessages>,
    resources: IUnisonServerResources,
) {
  broadcastMessages(resources, io)

  io.on('connect', async client => {
    handleConnection(client, resources)
  })
}

function handleConnection(
    client: Socket<ClientMessages, ServerMessages>,
    resources: IUnisonServerResources,
) {
  const connectionMap = new Map<string, OrdererConnection>()
  const connecting = new Set<string>()

  client.on('connectDocument', async (options, callback) => {
    if (connecting.has(options.documentId) || connectionMap.has(options.documentId)) {
      callback(alreadyConnected(options.documentId))
      return
    }

    try {
      connecting.add(options.documentId)
      const result = await connectDocument(client, options, resources)

      if (result.isErr()) {
        callback(result.error)
        return
      }

      const connection = result.value

      connectionMap.set(options.documentId, connection)

      callback({ success: true })
    } finally {
      connecting.delete(options.documentId)
    }
  })

  client.on('submitOps', (documentId, message) => {
    const connection = connectionMap.get(documentId)
    if (!connection) {
      // TODO: send error response
      return
    }

    if (message.type !== MessageType.Operation)
      return;

    connection.send({
      clientId: client.id,
      operation: {
        type: MessageType.Operation,
        contents: message.contents,
        clientSequenceNumber: message.clientSequenceNumber,
      },
      timestamp: Date.now(),
    })
  })
}