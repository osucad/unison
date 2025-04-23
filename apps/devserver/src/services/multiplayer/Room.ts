import { DocumentMessage, ScopeTypes, SequencedMessage } from "@unison/shared-definitions";
import { EventEmitter } from "eventemitter3";
import { IProducer } from "../../multiplayer/IProducer";
import { ClientManager } from "./ClientManager";

export interface RawOperationMessage 
{
  readonly clientId: string | null;
  readonly timestamp: number;
  readonly operation: DocumentMessage;
}

export interface RoomEvents 
{
  noClients(): void;
}

export class Room extends EventEmitter<RoomEvents>
{
  constructor(
    readonly documentId: string,
    readonly deltasProducer: IProducer<SequencedMessage<DocumentMessage>>
  ) 
  {
    super();
  }

  private readonly clientManager = new ClientManager();

  private sequenceNumber = 0;

  process(messages: RawOperationMessage[]) 
  {
    const messagesToProduce: SequencedMessage<DocumentMessage>[] = [];

    for (const message of messages) 
    {
      const operation = message.operation;

      if (operation.type === "join")
      {
        const isNewClient = this.clientManager.upsertClient(
          operation.contents.clientId,
          operation.clientSequenceNumber,
          operation.contents.detail.scopes,
        );

        if (!isNewClient)
          return;
      }

      if (message.operation.type === "leave")
      {
        const leaveInfo = message.operation;

        if (!this.clientManager.removeClient(leaveInfo.contents.clientId))
          return;

        if (this.clientManager.count() === 0)
          this.emit("noClients");
      }

      if (message.operation.type === "op")
      {
        if (!message.clientId)
          return;

        this.clientManager.upsertClient(
          message.clientId,
          operation.clientSequenceNumber,
        );

        const client = this.clientManager.get(message.clientId);

        if (!client || !client.scopes.includes(ScopeTypes.Write)) 
        {
          // TODO: Add way to send nack messages
          return;
        }
      }

      const sequenceNumber = this.nextSequenceNumber();

      messagesToProduce.push({
        clientId: message.clientId,
        clientSequenceNumber: message.operation.clientSequenceNumber,
        contents: message.operation,
        sequenceNumber,
        type: message.operation.type,
      });
    }

    if (messagesToProduce.length > 0)
      this.deltasProducer.send(messagesToProduce);
  }

  private nextSequenceNumber() 
  {
    return ++this.sequenceNumber;
  }
}