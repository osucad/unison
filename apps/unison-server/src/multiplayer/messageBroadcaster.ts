import { Server } from "socket.io";
import { IUnisonServerResources } from "../services/IUnisonServerResources";
import { ClientMessages, ServerMessages } from "@unison/protocol";

export function broadcastMessages(
  { ordererService }: IUnisonServerResources,
  io: Server<ClientMessages, ServerMessages>
) 
{
  ordererService.on('deltasProduced', (documentId, deltas) => 
  {
    io.to(documentId).emit('deltas', documentId, deltas);
  });
}