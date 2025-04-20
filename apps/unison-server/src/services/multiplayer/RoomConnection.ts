import { IClient, ISubmitOps, MessageType } from "@unison/shared-definitions";
import { RawOperationMessage } from "./Room";

export class RoomConnection
{
  constructor(
    private readonly documentId: string,
    private readonly clientId: string,
    send: (message: RawOperationMessage) => void
  ) 
  {
    this.send = (message: RawOperationMessage) => 
    {
      if (this.closed)
        return;

      send(message);
    };
  }

  private readonly send: (message: RawOperationMessage) => void;

  private closed = false;

  connect(client: IClient)
  {
    this.send({
      operation: {
        type: MessageType.ClientJoin,
        clientSequenceNumber: -1,
        contents: {
          clientId: this.clientId,
          detail: client
        }
      },
      clientId: null,
      timestamp: Date.now(),
    });
  }

  sendOps(operation: ISubmitOps)
  {
    this.send({
      clientId: this.clientId,
      operation: operation,
      timestamp: Date.now()
    });
  }

  public close() 
  {
    if (this.closed)
      return;

    this.closed = true;

    this.send({
      clientId: null,
      timestamp: Date.now(),
      operation: {
        type: MessageType.ClientLeave,
        clientSequenceNumber: -1,
        contents: { clientId: this.clientId }
      }
    });
  }
}