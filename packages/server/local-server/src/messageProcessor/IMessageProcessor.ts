import { IQueuedMessage } from "../kafka/index.js";

export interface IMessageProcessor
{
  process(message: IQueuedMessage): Promise<void>;

  close(): void;
}