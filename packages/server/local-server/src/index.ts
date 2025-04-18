import { IQueuedMessage, LocalKafka } from "./kafka/index.js";

export * from "./kafka/index.js";

const kafka = new LocalKafka();

kafka.subscribe({
  process(message: IQueuedMessage): Promise<void> | void
  {
    console.log(message);
  }
});

kafka.send([{
  documentId: "foo",
  type: "asdf"
}], "foo");