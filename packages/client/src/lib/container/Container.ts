import { ISequencedDocumentMessage } from "@unison/protocol";
import { DeltaStream } from "./DeltaStream.js";
import { UnisonRuntime } from "./UnisonRuntime.js";

export class Container {
  constructor(
      readonly runtime: UnisonRuntime,
      readonly deltas?: DeltaStream
  ) {
    if (deltas)
      this.connectDeltaStream(deltas)
  }

  connectDeltaStream(deltas: DeltaStream) {
    deltas.on('deltasReceived', this.onDeltasReceived)
  }

  private onDeltasReceived = (deltas: readonly ISequencedDocumentMessage[]) => {
    console.log('deltas received', deltas)
  }
}