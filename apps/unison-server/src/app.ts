import express, { Express } from "express";
import http from "node:http";
import { Server } from "socket.io";
import { handleWebSockets } from "./multiplayer/websocket";
import { IUnisonServerResources } from "./services/IUnisonServerResources";
import { OrdererService } from "./services/sequencer/OrdererService";
import { InsecureTokenVerifier } from "./services/InsecureTokenVerifier";

export async function createApp(): Promise<Express> {
  const resources: IUnisonServerResources = {
    ordererService: new OrdererService(),
    tokenVerifier: new InsecureTokenVerifier(),
  }

  const app = express();
  const server = http.createServer(app)
  const io = new Server(server)

  handleWebSockets(io, resources)

  return app
}