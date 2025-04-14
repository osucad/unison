/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as http from 'node:http'
import { Server } from 'socket.io';
import { handleWebSockets } from "./websocket";

const app = express();
const server = http.createServer(app)
const io = new Server(server, {
  path: '/api/v1/ws'
})

handleWebSockets(io)

const port = process.env.PORT || 3333;

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);
