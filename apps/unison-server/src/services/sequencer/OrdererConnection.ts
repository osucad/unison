import { MessageSequencer, RawOperationMessage } from "./MessageSequencer";

export class OrdererConnection {
  constructor(
      private readonly getSequencer: () => MessageSequencer
  ) {
  }

  send(message: RawOperationMessage) {
    this.getSequencer().process(message)
  }
}