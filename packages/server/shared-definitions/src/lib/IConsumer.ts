import { IMessage } from "./IMessage.js";

export interface IConsumer<T = IMessage>
{
  resume(): Promise<void>;

  close(): Promise<void>;

  on(event: "data", fn: (message: T) => void): void;
}