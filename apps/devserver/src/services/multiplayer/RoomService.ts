import { ISequencedDocumentMessage } from "@unison/shared-definitions";
import { EventEmitter } from "eventemitter3";
import { IProducer } from "../../multiplayer/IProducer";
import { Room } from "./Room";
import { RoomConnection } from "./RoomConnection";

export interface RoomServiceEvents
{
  deltasProduced: (documentId: string, deltas: ISequencedDocumentMessage[]) => void;
  stop: () => void;
}

export class RoomService extends EventEmitter<RoomServiceEvents>
{
  private readonly rooms = new Map<string, Room>();

  async getConnection(documentId: string, clientId: string): Promise<RoomConnection>
  {
    return new RoomConnection(
      documentId,
      clientId,
      message => this.getRoom(documentId).process([message])
    );
  }

  private getRoom(documentId: string)
  {
    let room = this.rooms.get(documentId);

    if (!room)
      room = this.createRoom(documentId);

    return room;
  }

  private createRoom(documentId: string)
  {
    const room = new Room(
      documentId,
      new DeltasProducer(documentId, this.onMessagesProduced)
    );

    room.on("noClients", () => this.rooms.delete(documentId));

    this.rooms.set(documentId, room);

    return room;
  }

  private onMessagesProduced = (messages: ISequencedDocumentMessage[], documentId: string) => 
  {
    this.emit("deltasProduced", documentId, messages);
  };
}

export class DeltasProducer implements IProducer<ISequencedDocumentMessage>
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