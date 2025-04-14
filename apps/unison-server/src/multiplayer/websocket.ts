import { Server, Socket } from "socket.io";
import { ClientMessages, ServerMessages } from "@unison/protocol";
import { connectDocument } from "./connectDocument";

export function handleWebSockets(io: Server<ClientMessages, ServerMessages>) {
  io.on('connect', client => {
    handleConnection(client)
  })
}

function handleConnection(client: Socket<ClientMessages, ServerMessages>) {
  client.on('connectDocument', async (options, callback) => callback(await connectDocument(client, options)))
}