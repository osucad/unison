import { ClientMessages, ISequencedDocumentMessage, ServerMessages } from "@unison/protocol";
import { Socket } from "socket.io-client";
import { Deferred } from "./util/deferred.js";

export interface ICatchUpResult {
  deltas: ISequencedDocumentMessage[]
}

export async function catchUpWithDeltaStream(
    documentId: string,
    connection: Socket<ServerMessages, ClientMessages>,
    abortSignal?: AbortSignal
): Promise<ICatchUpResult> {
  const deferred = new Deferred<ICatchUpResult>()

  let deltasReceived = false
  const receivedDeltas: ISequencedDocumentMessage[] = []

  function onDeltaReceived(id: string, deltas: ISequencedDocumentMessage[]) {
    if (id !== documentId || deltas.length === 0)
      return

    receivedDeltas.push(...deltas)

    if (!deltasReceived) {
      deltasReceived = true
      fetchRemainingDeltas(deltas[0].sequenceNumber)
    }
  }

  connection.on('deltas', onDeltaReceived)

  async function fetchRemainingDeltas(lastKnownSequencedNumber: number) {
    // TODO: actually fetch the deltas

    deferred.resolve({ deltas: receivedDeltas })
  }

  deferred.promise.finally(() => connection.off('deltas', onDeltaReceived))

  if (abortSignal)
    abortSignal.onabort = () => deferred.reject()

  return deferred.promise
}
