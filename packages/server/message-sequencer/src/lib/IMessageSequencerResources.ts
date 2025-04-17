import { IConsumer, IProducer, RawOperationMessage } from "@unison-server/shared-definitions";
import { ISequencedDocumentMessage } from "@unison/shared-definitions";
import { IMessageSequencerFactory } from "./MessageSequencerFactory.js";

export interface IMessageSequencerResources
{
  messageSequencerFactory: IMessageSequencerFactory;
  rawDeltasConsumer: IConsumer<RawOperationMessage>;
  deltasProducer: IProducer<ISequencedDocumentMessage>;
  signalsProducer: IProducer<ISequencedDocumentMessage>;
}