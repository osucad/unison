export interface IProducer<T> 
{
  send(messages: T[]): void;
}