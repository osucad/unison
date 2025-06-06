import compression from "compression";
import cors from "cors";
import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import { handleWebSockets } from "./multiplayer/websocket";
import { createRoutes } from "./routes";
import { IUnisonServerResources } from "./services/IUnisonServerResources";
import { writeDeltasToStorage } from "./services/writeDeltasToStorage";

export async function createApp(resources: IUnisonServerResources) 
{
  const app = express();
  app.use(cors());
  app.use(compression());
  app.use(express.json());

  const server = http.createServer(app);
  const io = new Server(server, {
    perMessageDeflate: true,
    cors: {
      origin: "*"
    }
  });

  const routes = createRoutes(resources);

  app.use(routes.summaries);
  app.use(routes.deltas);

  handleWebSockets(io, resources);
  writeDeltasToStorage(resources);

  return server;
}