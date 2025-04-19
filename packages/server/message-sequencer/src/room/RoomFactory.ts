import { IProducer } from "@unison-server/shared-definitions";
import { ISequencedDocumentMessage } from "@unison/shared-definitions";
import { ICheckpointManager } from "./ICheckpointManager.js";
import { Room } from "./Room.js";

export interface IRoomInfo
{
  documentId: string;
}

export class RoomFactory
{
  constructor(
    private readonly deltasProducer: IProducer<ISequencedDocumentMessage>,
    private readonly signalsProducer: IProducer<ISequencedDocumentMessage>,
    private readonly checkpointManager: ICheckpointManager
  )
  {
  }

  async create({ documentId }: IRoomInfo): Promise<Room>
  {
    const { deltasProducer, signalsProducer } = this;

    let checkpoint = await this.checkpointManager.getCheckpoint(documentId);
    if (!checkpoint) 
    {
      checkpoint = {
        sequenceNumber: 0,
        clients: undefined,
      };
    }

    return new Room(
      documentId,
      deltasProducer,
      signalsProducer,
      checkpoint,
    );
  }
}