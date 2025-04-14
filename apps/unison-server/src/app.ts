import express, { Express } from "express";
import http from "node:http";
import { Server } from "socket.io";
import { handleWebSockets } from "./multiplayer/websocket";

export async function createApp(): Promise<Express> {
  const app = express();
  const server = http.createServer(app)
  const io = new Server(server)

  handleWebSockets(io)

  return app
}