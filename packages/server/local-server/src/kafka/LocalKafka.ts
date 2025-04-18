import { IMessage, IProducer } from "@unison-server/shared-definitions";
import Deque from "double-ended-queue";
import { IKafkaSubscriber } from "./IKafkaSubscriber.js";
import { LocalKafkaSubscription } from "./LocalKafkaSubscription.js";

export interface IQueuedMessage 
{
  topic: string;
  offset: number;
  partition: number;
  value: string;
}

export class LocalKafka implements IProducer 
{
  private queue = new Deque<IQueuedMessage>();
  private subscriptions: LocalKafkaSubscription[] = [];

  private messageOffset = 0;
  private minimumQueueOffset = 0;

  public subscribe(subscriber: IKafkaSubscriber)
  {
    const subscription = new LocalKafkaSubscription(subscriber, this.queue);

    subscription.on("processed", queueOffset =>
    {
      if (this.minimumQueueOffset >= queueOffset)
        return;

      for (const subscription of this.subscriptions) 
      {
        if (subscription.queueOffset < queueOffset)
          return;
      }

      const diff = queueOffset - this.minimumQueueOffset;
      this.minimumQueueOffset = queueOffset - 1;

      for (let i = 0; i < diff; i++)
        this.queue.shift();

      for (const subscription of this.subscriptions)
        subscription.queueOffset -= diff;
    });

    this.subscriptions.push(subscription);
  }

  public async send(messages: IMessage[], topic: string): Promise<void> 
  {
    for (const message of messages) 
    {
      const queuedMessage: IQueuedMessage = {
        partition: 0,
        offset: this.messageOffset,
        topic,
        value: JSON.stringify(message)
      };

      this.messageOffset++;

      this.queue.push(queuedMessage);
    }

    for (const subscription of this.subscriptions) 
    {
      subscription.process().catch(console.error);
    }
  }

  close() 
  {
    this.queue.clear();
    for (const subscription of this.subscriptions)
      subscription.close();

    this.subscriptions.length = 0;
  }
}