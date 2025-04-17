export class Deferred<T> 
{
  resolve!: (value: T | PromiseLike<T>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject!: (reason?: any) => void;

  readonly promise: Promise<T>;

  constructor() 
  {
    this.promise = new Promise<T>((resolve, reject) => 
    {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}