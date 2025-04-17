export interface IConsumer<T> 
{
  resume(): Promise<void>;

  close(): Promise<void>;

  on(event: "data", fn: (message: T) => void): void;
}