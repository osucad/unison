import { IConsumer, IProducer, RawOperationMessage } from "@unison-server/shared-definitions";
import { ISequencedDocumentMessage } from "@unison/shared-definitions";

export interface IMessageSequencerResources
{
  rawDeltasConsumer: IConsumer<RawOperationMessage>;
  deltasProducer: IProducer<ISequencedDocumentMessage>;
  signalsProducer: IProducer<ISequencedDocumentMessage>;
}