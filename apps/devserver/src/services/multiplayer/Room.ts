import { DocumentMessage, IClientLeave, ISequencedDocumentMessage, MessageType, ScopeTypes } from "@unison/shared-definitions";
import { EventEmitter } from "eventemitter3";
import { ClientManager } from "./ClientManager";
import { IProducer } from "../../multiplayer/IProducer";

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
    readonly deltasProducer: IProducer<ISequencedDocumentMessage>
  ) 
  {
    super();
  }

  private readonly clientManager = new ClientManager();

  private sequenceNumber = 0;

  process(messages: RawOperationMessage[]) 
  {
    const messagesToProduce: ISequencedDocumentMessage[] = [];

    for (const message of messages) 
    {
      const operation = message.operation;

      if (operation.type === MessageType.ClientJoin) 
      {
        const isNewClient = this.clientManager.upsertClient(
          operation.contents.clientId,
          operation.clientSequenceNumber,
          operation.contents.detail.scopes,
        );

        if (!isNewClient)
          return;
      }

      if (message.operation.type === MessageType.ClientLeave) 
      {
        const leaveInfo = message.operation as IClientLeave;

        if (!this.clientManager.removeClient(leaveInfo.contents.clientId))
          return;

        if (this.clientManager.count() === 0)
          this.emit("noClients");
      }

      if (message.operation.type === MessageType.Delta)
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
        operation: message.operation.contents,
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