import { IRunner, IRunnerFactory } from "@unison-server/service-runner";
import nconf from "nconf";
import { RoomManagerResources } from "./RoomManagerResources.js";
import { RoomFactory } from "./RoomFactory.js";
import { RoomProcessor } from "./RoomProcessor.js";

export class RoomManagerFactory implements IRunnerFactory<RoomManagerResources>
{
  async create(
    config: nconf.Provider,
    resources: RoomManagerResources
  ): Promise<IRunner> 
  {
    const {
      rawDeltasConsumer,
      deltasProducer,
      signalsProducer,
      checkpointManager,
    } = resources;

    const messageSequencerFactory = new RoomFactory(
      deltasProducer,
      signalsProducer,
      checkpointManager,
    );

    return new RoomProcessor(
      config,
      messageSequencerFactory,
      rawDeltasConsumer,
    );
  }
}