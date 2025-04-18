import Deque from "double-ended-queue";
import { EventEmitter } from "eventemitter3";
import { IKafkaSubscriber } from "./IKafkaSubscriber.js";
import { IQueuedMessage } from "./LocalKafka.js";

export interface LocalKafkaSubscriptionEvents 
{
  processed(queueOffset: number): void;
  close(): void;
}

export class LocalKafkaSubscription extends EventEmitter<LocalKafkaSubscriptionEvents>
{
  public queueOffset = 0;

  private processing = false;
  private closed = false;
  private retryTimer: NodeJS.Timeout | undefined;

  constructor(
    private readonly subscriber: IKafkaSubscriber,
    private queue: Deque<IQueuedMessage>
  ) 
  {
    super();
  }

  public close() 
  {
    this.closed = true;

    if (this.retryTimer) 
    {
      clearTimeout(this.retryTimer);
      this.retryTimer = undefined;
    }

    this.emit("close");
    this.removeAllListeners();
  }

  async process()
  {
    if (this.queue.length <= this.queueOffset || this.processing || this.closed)
      return;

    const message = this.queue.get(this.queueOffset);

    if (message !== undefined) 
    {
      try 
      {
        this.processing = true;

        const optionalPromise = this.subscriber.process(message);
        if (optionalPromise !== undefined)
          await optionalPromise;


        this.queueOffset++;

        this.emit("processed", this.queueOffset);
      }
      catch (e)
      {
        console.log(e);

        this.retryTimer = setTimeout(() => 
        {
          this.retryTimer = undefined;
          this.process().catch((e) => this.handleProcessError(e));
        }, 500);

        return;
      }
      finally 
      {
        this.processing = false;
      }
    }

    this.process().catch((e) => this.handleProcessError(e));
  }

  private handleProcessError(error: unknown) 
  {
    console.error("Error in LocalKafkaSubscription.process()", error);
  }
}