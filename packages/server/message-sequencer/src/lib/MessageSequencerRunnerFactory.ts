import { IRunner, IRunnerFactory } from "@unison-server/service-runner";
import nconf from "nconf";
import { IMessageSequencerResources } from "./IMessageSequencerResources.js";
import { MessageSequencerFactory } from "./MessageSequencerFactory.js";
import { MessageSequencerRunner } from "./MessageSequencerRunner.js";

export class MessageSequencerRunnerFactory implements IRunnerFactory<IMessageSequencerResources> 
{
  async create(
    config: nconf.Provider,
    {
      rawDeltasConsumer,
      deltasProducer,
      signalsProducer,
    }: IMessageSequencerResources
  ): Promise<IRunner> 
  {
    const messageSequencerFactory = new MessageSequencerFactory(
      config,
      deltasProducer,
      signalsProducer
    );

    return new MessageSequencerRunner(
      config,
      messageSequencerFactory,
      rawDeltasConsumer,
    );
  }
}