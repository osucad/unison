import { RawOperationMessage } from "./MessageSequencer";

export class OrdererConnection {
  constructor(
      readonly send: (message: RawOperationMessage) => void
  ) {
  }
}