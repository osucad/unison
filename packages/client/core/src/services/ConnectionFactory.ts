import { ClientMessages, ServerMessages } from "@unison/shared-definitions";
import { io, Socket } from "socket.io-client";

export type UnisonClientSocket = Socket<ServerMessages, ClientMessages>;

export class ConnectionFactory 
{
  constructor(private readonly endpoint: string,)
  {
  }


  async getConnection(): Promise<UnisonClientSocket>
  {
    const socket: UnisonClientSocket = io(
      this.endpoint,
      {
        transports: ["websocket"],
        autoConnect: false,
      }
    );

    await new Promise<void>((resolve, reject) =>
    {
      socket.once("connect", () =>  resolve());
      socket.once("connect_error", reject);
    });

    return socket;
  }
}