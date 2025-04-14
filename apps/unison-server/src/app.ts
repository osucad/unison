import express from "express";
import http from "node:http";
import cors from "cors";
import { Server } from "socket.io";
import { handleWebSockets } from "./multiplayer/websocket";
import { IUnisonServerResources } from "./services/IUnisonServerResources";
import { OrdererService } from "./services/sequencer/OrdererService";
import { InsecureTokenVerifier } from "./services/InsecureTokenVerifier";

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

  handleWebSockets(io, resources)

  resources.ordererService.start()

  return server
}