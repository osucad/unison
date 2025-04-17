import { RawOperationMessage } from "@unison-server/shared-definitions";
import { cargoQueue, queue, QueueObject } from "async";
import { EventEmitter } from "eventemitter3";
import nconf from "nconf";
import { MessageSequencer } from "./MessageSequencer.js";
import { IMessageSequencerFactory, IMessageSequencerOptions } from "./MessageSequencerFactory.js";

enum PartitionState 
{
  Starting,
  Ready,
  Started,
  Stopping,
  Stopped,
}

export interface DocumentPartitionEvents 
{
  started(partition: DocumentPartition): void;

  stopped(partition: DocumentPartition): void;

  error(partition: DocumentPartition, err: unknown): void;
}

export class DocumentPartition extends EventEmitter<DocumentPartitionEvents> 
{
  readonly documentId: string;

  private sequencer!: MessageSequencer;
  private queue: QueueObject<RawOperationMessage>;
  private status: PartitionState;

  private lastMessageProcessedAt = -1;

  constructor(
    config: nconf.Provider,
    factory: IMessageSequencerFactory,
    documentId: string,
  )
  {
    super();

    this.documentId = documentId;
    this.status = PartitionState.Starting;

    const concurrency = 1;
    const maxBatchSize = config.get("sequencer:maxBatchSize") ?? 50;

    this.queue = cargoQueue(
      async (messages) =>
        this.sequencer.process(messages)
          .then(() => this.lastMessageProcessedAt = Date.now())
          .catch(this.emitError),
      concurrency,
      maxBatchSize,
    );
    this.queue.pause();

    this.initP = factory.create({ documentId }).then(sequencer =>
    {
      if (this.status !== PartitionState.Starting)
        return;

      this.sequencer = sequencer;
      this.status = PartitionState.Ready;

    }).catch(this.emitError);
  }

  private initP: Promise<unknown>;

  start() 
  {
    this.initP.then(() => 
    {
      if (this.status !== PartitionState.Ready)
        return;

      this.queue.resume();
      this.status = PartitionState.Started;
      this.emit("started", this);
    });
  }

  async stop(gracefully = true) 
  {
    if (this.status === PartitionState.Stopping || this.status === PartitionState.Stopped)
      return;

    this.status = PartitionState.Stopping;

    const stop = async () =>
      gracefully
        ? this.queue.drain()
        : this.queue.kill();

    await stop().finally(() => 
    {
      this.status = PartitionState.Stopped;
      this.emit("stopped", this);
    }).catch(this.emitError);
  }


  process(message: RawOperationMessage) 
  {
    void this.queue.push(message);
  }

  hasPendingWork() 
  {
    return !this.queue.idle();
  }

  get idleDuration() 
  {
    return Date.now() - this.lastMessageProcessedAt;
  }

  private emitError = (err: unknown) =>
    this.emit("error", this, err);
}