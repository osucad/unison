import { IMessage } from "./IMessage.js";

export interface IProducer<T = IMessage>
{
  send(messages: T[], documentId: string): Promise<void>;
}