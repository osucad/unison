import cors from "cors";
import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import { handleWebSockets } from "./multiplayer/websocket";
import { createRoutes } from "./routes";
import { InsecureTokenVerifier } from "./services/InsecureTokenVerifier";
import { IUnisonServerResources } from "./services/IUnisonServerResources";
import { OrdererService } from "./services/sequencer/OrdererService";

export async function createApp() {
  const resources: IUnisonServerResources = {
    ordererService: new OrdererService(),
    tokenVerifier: new InsecureTokenVerifier(),
  }

  const app = express();
  app.use(cors())

  const server = http.createServer(app)
  const io = new Server(server, {
    cors: {
      origin: '*'
    }
  })

  const routes = createRoutes(resources)

  app.use(routes.summaries)

  handleWebSockets(io, resources)

  resources.ordererService.start()

  return server
}