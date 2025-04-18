import { IProducer } from "@unison-server/shared-definitions";
import { ISequencedDocumentMessage } from "@unison/shared-definitions";
import nconf from "nconf";
import { MessageSequencer } from "./MessageSequencer.js";

export interface IMessageSequencerOptions 
{
  documentId: string;
}

export interface IMessageSequencerFactory 
{
  create(config: IMessageSequencerOptions): Promise<MessageSequencer>;
}

export class MessageSequencerFactory implements IMessageSequencerFactory
{
  constructor(
    private readonly config: nconf.Provider,
    private readonly deltasProducer: IProducer<ISequencedDocumentMessage>,
    private readonly signalsProducer: IProducer<ISequencedDocumentMessage>,
  )
  {
  }

  async create({ documentId }: IMessageSequencerOptions): Promise<MessageSequencer> 
  {
    const { deltasProducer, signalsProducer } = this;

    return new MessageSequencer(
      documentId,
      deltasProducer,
      signalsProducer,
    );
  }
}