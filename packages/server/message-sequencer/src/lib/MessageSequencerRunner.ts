import { ISequencedDocumentMessage } from "@unison/shared-definitions";
import nconf from "nconf";
import { IRunner } from "@unison-server/service-runner";
import { IConsumer, IProducer, RawOperationMessage } from "@unison-server/shared-definitions";
import { DocumentPartition } from "./DocumentPartition.js";
import { IMessageSequencerFactory } from "./MessageSequencerFactory.js";

export class MessageSequencerRunner implements IRunner
{
  private partitions = new Map<string, DocumentPartition>;
  private stoppingPartitions = new Map<string, Promise<void>>;
  private idleCheckInterval?: NodeJS.Timer;

  constructor(
    private readonly config: nconf.Provider,
    private readonly sequencerFactory: IMessageSequencerFactory,
    private readonly consumer: IConsumer<RawOperationMessage>,
  ) 
  {
  }

  async start(): Promise<void> 
  {
    this.startIdleTimer();
    this.consumer.on("data", message => this.process(message));
    await this.consumer.resume();
  }

  private process(message: RawOperationMessage) 
  {
    const documentId = message.documentId;

    let partition = this.partitions.get(documentId);

    if (!partition)
      partition = this.createPartition(message.documentId);


    partition.process(message);
  }

  private onError({ documentId }: DocumentPartition, err: unknown) 
  {
    console.error("Error processing message", err, { documentId });
  }

  private startIdleTimer() 
  {
    this.idleCheckInterval = setInterval(() => 
    {
      for (const [, partition] of [...this.partitions]) 
      {
        if (partition.idleDuration > 60_000)
          void this.stopPartition(partition.documentId);
      }
    }, 10_000);
  }

  private createPartition(documentId: string) 
  {
    const partition = new DocumentPartition(
      this.config,
      this.sequencerFactory,
      documentId,
    );

    this.partitions.set(documentId, partition);

    partition.on("error", this.onError, this);

    const stopP = this.stoppingPartitions.get(documentId);
    if (stopP)
      stopP.finally(() => partition.start());
    else
      partition.start();

    return partition;
  }

  private stopPartition = async (documentId: string) => 
  {
    const partition = this.partitions.get(documentId);
    if (!partition) 
    {
      console.warn("Tried to stop non-existent partition", { documentId });
      return;
    }

    this.partitions.delete(documentId);

    const stopP = partition.stop();

    this.stoppingPartitions.set(documentId, stopP);

    return stopP.then(() => this.stoppingPartitions.delete(documentId));
  };

  private stopAllPartitions() 
  {
    return Promise.allSettled(
      [...this.partitions.keys()]
        .map(this.stopPartition)
    );
  }

  async stop(reason?: string, error?: any): Promise<void> 
  {
    if (this.idleCheckInterval)
      clearInterval(this.idleCheckInterval);

    await Promise.allSettled([
      this.consumer.close(),
      this.stopAllPartitions(),
    ]);
  }
}