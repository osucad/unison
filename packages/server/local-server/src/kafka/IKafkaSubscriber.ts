import { IQueuedMessage } from "./LocalKafka.js";

export interface IKafkaSubscriber
{
  process(message: IQueuedMessage): Promise<void> | void;
}