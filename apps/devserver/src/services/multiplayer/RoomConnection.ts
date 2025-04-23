import { ClientDetail, DocumentOperation } from "@unison/shared-definitions";
import { RawOperationMessage } from "./Room";

export class RoomConnection 
{
  private readonly documentId: string;
  private readonly clientId: string;

  constructor(
    { documentId, clientId, }: { documentId: string; clientId: string },
    send: (message: RawOperationMessage) => void
  ) 
  {
    this.documentId = documentId;
    this.clientId = clientId;

    this
      .send = (message: RawOperationMessage) => 
      {
        if (this.closed)
          return;

        send(message);
      };
  }

  private readonly send: (message: RawOperationMessage) => void;

  private closed = false;

  connect(client: ClientDetail) 
  {
    this.send({
      operation: {
        type: "join",
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

  sendOps(operation: DocumentOperation) 
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

    this.send({
      clientId: null,
      timestamp: Date.now(),
      operation: {
        type: "leave",
        clientSequenceNumber: -1,
        contents: { clientId: this.clientId }
      }
    });

    this.closed = true;
  }
}