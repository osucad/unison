import { IRoomCheckpoint } from "./Room.js";

export interface ICheckpointManager
{
  getCheckpoint(documentId: string): Promise<IRoomCheckpoint | undefined>;
}