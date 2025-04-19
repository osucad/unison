import { Server } from "socket.io";
import { IUnisonServerResources } from "../services/IUnisonServerResources";
import { ClientMessages, ServerMessages } from "@unison/shared-definitions";

export function broadcastMessages(
  { roomService }: IUnisonServerResources,
  io: Server<ClientMessages, ServerMessages>
) 
{
  roomService.on("deltasProduced", (documentId, deltas) =>
  {
    io.to(documentId).emit("deltas", documentId, deltas);
  });
}