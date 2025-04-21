import { IProducer, RawOperationMessage } from "@unison-server/shared-definitions";
import { DocumentMessage, ISequencedDocumentMessage, MessageType, ScopeTypes } from "@unison/shared-definitions";
import { EventEmitter } from "eventemitter3";
import { ClientManager, IClientSequence } from "./ClientManager.js";

export interface RoomEvents 
{
  noClients(): void;
}

export interface IRoomCheckpoint 
{
  sequenceNumber: number;
  clients: IClientSequence[] | undefined;
}

const systemMessageTypes = [MessageType.ClientJoin, MessageType.ClientLeave] as const;

function isSystemMessage(operation: DocumentMessage)
  : operation is Extract<DocumentMessage, { type: typeof systemMessageTypes[keyof typeof systemMessageTypes] }>
{
  return (systemMessageTypes as readonly string[]).includes(operation.type);
}

function requiresWriteScope(operation: DocumentMessage)
{
  return operation.type === MessageType.Delta;
}

function isReadonlyClient(client: IClientSequence) 
{
  return !client.scopes.includes(ScopeTypes.Write);
}

enum SendTarget 
{
  Deltas = "deltas",
  Signal = "signals",
}

export class Room extends EventEmitter<RoomEvents>
{
  constructor(
    private readonly documentId: string,
    private readonly deltasProducer: IProducer<ISequencedDocumentMessage>,
    private readonly signalsProducer: IProducer<ISequencedDocumentMessage>,
    lastCheckpoint: IRoomCheckpoint,
  ) 
  {
    super();

    if (lastCheckpoint)
    {
      this.sequenceNumber = lastCheckpoint.sequenceNumber;
      if (lastCheckpoint.clients !== undefined)
        this.clientManager.restore(lastCheckpoint.clients);
    }
  }

  private readonly clientManager = new ClientManager();
  private sequenceNumber = 0;

  public async process(messages: RawOperationMessage[]): Promise<void> 
  {
    const deltasToProduce: ISequencedDocumentMessage[] = [];
    const signalsToProduce: ISequencedDocumentMessage[] = [];

    for (const message of messages) 
    {
      const ticketResult = this.ticket(message);
      if (!ticketResult)
        continue;

      const { sendTarget, ticketedMessage } = ticketResult;

      switch (sendTarget) 
      {
        case SendTarget.Deltas:
          deltasToProduce.push(ticketedMessage);
          break;
        case SendTarget.Signal:
          signalsToProduce.push(ticketedMessage);
          break;
      }
    }

    if (deltasToProduce.length > 0)
      void this.deltasProducer.send(deltasToProduce, this.documentId);
    if (signalsToProduce.length > 0)
      void this.signalsProducer.send(signalsToProduce, this.documentId);
  }

  private ticket(message: RawOperationMessage) 
  {
    const operation = message.operation;

    if (isSystemMessage(operation)) 
    {
      switch (operation.type) 
      {
        case MessageType.ClientJoin: {
          const isNewClient = this.clientManager.upsertClient(
            operation.contents.clientId,
            operation.clientSequenceNumber,
            message.timestamp,
            operation.contents.detail.scopes,
          );

          if (!isNewClient)
            return;

          break;
        }
        case MessageType.ClientLeave: {
          if (!this.clientManager.removeClient(operation.contents.clientId))
            return;

          if (this.clientManager.count() === 0) 
            this.emit("noClients");
          break;
        }
      }
    }
    else if (requiresWriteScope(operation) && message.clientId !== null) 
    {
      const client = this.clientManager.get(message.clientId);
      if (!client || isReadonlyClient(client))
        return;
    }

    let sequenceNumber = this.sequenceNumber;

    if (operation.type !== MessageType.Signal)
      sequenceNumber = ++this.sequenceNumber;

    const ticketedMessage: ISequencedDocumentMessage = {
      clientId: message.clientId,
      sequenceNumber,
      clientSequenceNumber: operation.clientSequenceNumber,
      contents: operation.contents,
      type: operation.type,
    };

    let sendTarget: SendTarget = SendTarget.Deltas;

    if (operation.type === MessageType.Signal)
      sendTarget = SendTarget.Signal;

    return {
      ticketedMessage,
      sendTarget
    };
  }

  public createCheckpoint(): IRoomCheckpoint 
  {
    const {sequenceNumber, clientManager} = this;

    return {
      sequenceNumber,
      clients: clientManager.createCheckpoint()
    };
  }
}