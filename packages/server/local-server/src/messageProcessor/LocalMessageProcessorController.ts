import { EventEmitter } from "eventemitter3";
import { IKafkaSubscriber, IQueuedMessage, LocalKafka } from "../kafka/index.js";
import { IMessageProcessor } from "./IMessageProcessor.js";


export class LocalMessageProcessorController
  extends EventEmitter<{
    started(): void;
    closed(): void;
  }>
  implements IKafkaSubscriber 
{
  constructor(
    kafka: LocalKafka,
    createHandler: () => Promise<IMessageProcessor>
  ) 
  {
    super();

    this.createP = createHandler()
      .then(handler => 
      {
        this.handler = handler;
        if (!this.closed) 
        {
          kafka.subscribe(this);

          this.emit("started");
        }
      });
  }

  private readonly createP: Promise<void>;
  private handler!: IMessageProcessor;

  private closed = false;

  public process = (message: IQueuedMessage) => this.handler.process(message);

  public close()
  {
    this.closed = true;
    this.createP.finally(() => 
    {
      this.handler?.close();
      this.emit("closed");
      this.removeAllListeners();
    });
  }
}