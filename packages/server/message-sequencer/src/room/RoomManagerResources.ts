import { IConsumer, IProducer, RawOperationMessage } from "@unison-server/shared-definitions";
import { ISequencedDocumentMessage } from "@unison/shared-definitions";
import { ICheckpointManager } from "./ICheckpointManager.js";

export class RoomManagerResources
{
  constructor(
    readonly rawDeltasConsumer: IConsumer<RawOperationMessage>,
    readonly deltasProducer: IProducer<ISequencedDocumentMessage>,
    readonly signalsProducer: IProducer<ISequencedDocumentMessage>,
    readonly checkpointManager: ICheckpointManager,
  ) 
  {
  }
}