import { ISequencedDocumentMessage } from "@unison/shared-definitions";
import { EventEmitter } from "eventemitter3";
import { IProducer } from "../../multiplayer/IProducer";
import { MessageSequencer, RawOperationMessage } from "./MessageSequencer";
import { RoomConnection } from "./RoomConnection";

export interface OrdererServiceEvents 
{
  deltasProduced: (documentId: string, deltas: ISequencedDocumentMessage[]) => void;
  stop: () => void;
}

export class RoomService extends EventEmitter<OrdererServiceEvents>
{
  private readonly sequencers = new Map<string, MessageSequencer>();

  private messageBuffer: [string, RawOperationMessage][] = [];

  private started = false;

  start() 
  {
    if (this.started)
      return;

    const interval = setInterval(() => this.poll(), 50);

    this.once("stop", () => clearInterval(interval));

    this.started = true;
  }

  stop() 
  {
    if (!this.started)
      return;

    this.emit("stop");

    this.started = false;
  }

  private poll() 
  {
    const messages = this.messageBuffer;
    this.messageBuffer = [];

    const groupedMessages = new Map<string, RawOperationMessage[]>();

    for (const [documentId, message] of messages) 
    {
      if (!groupedMessages.has(documentId))
        groupedMessages.set(documentId, []);

      groupedMessages.get(documentId)!.push(message);
    }

    for (const [documentId, messages] of groupedMessages) 
    {
      this.getSequencer(documentId).process(messages);
    }
  }

  async getConnection(documentId: string, clientId: string): Promise<RoomConnection>
  {
    return new RoomConnection(
      documentId,
      clientId,
      message =>
      {
        this.messageBuffer.push([documentId, message]);
      });
  }

  private getSequencer(documentId: string) 
  {
    let sequencer = this.sequencers.get(documentId);

    if (!sequencer)
      sequencer = this.createSequencer(documentId);

    return sequencer;
  }

  private createSequencer(documentId: string) 
  {
    const sequencer = new MessageSequencer(documentId, new DeltaProducer(documentId, this.onMessagesProduced));

    this.sequencers.set(documentId, sequencer);

    return sequencer;
  }

  private onMessagesProduced = (messages: ISequencedDocumentMessage[], documentId: string) => 
  {
    this.emit("deltasProduced", documentId, messages);
  };
}

export class DeltaProducer implements IProducer<ISequencedDocumentMessage> 
{
  constructor(
    readonly documentId: string,
    readonly onMessagesProduced: (messages: ISequencedDocumentMessage[], documentId: string) => void
  )
  {
  }

  send(messages: ISequencedDocumentMessage[]): void 
  {
    this.onMessagesProduced(messages, this.documentId);
  }
}