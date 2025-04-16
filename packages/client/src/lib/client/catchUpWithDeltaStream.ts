import { ClientMessages, IDocumentSummary, ISequencedDocumentMessage, ServerMessages } from "@unison/protocol";
import { Socket } from "socket.io-client";
import { Deferred } from "../util/deferred.js";
import { DocumentDeltaService } from "../services/DocumentDeltaService.js";

export interface ICatchUpResult 
{
  readonly summary: IDocumentSummary;
  readonly deltas: ISequencedDocumentMessage[];
}

export async function catchUpWithDeltaStream(
  documentId: string,
  connection: Socket<ServerMessages, ClientMessages>,
  summary: Promise<IDocumentSummary>,
  deltaService: DocumentDeltaService,
  abortSignal?: AbortSignal,
): Promise<ICatchUpResult> 
{
  const deferred = new Deferred<ICatchUpResult>();

  let deltasReceived = false;
  let receivedDeltas: ISequencedDocumentMessage[] = [];

  function onDeltaReceived(id: string, deltas: ISequencedDocumentMessage[]) 
  {
    if (id !== documentId || deltas.length === 0)
      return;

    receivedDeltas.push(...deltas);

    if (!deltasReceived) 
    {
      deltasReceived = true;
      fetchRemainingDeltas(deltas[0].sequenceNumber);
    }
  }

  connection.on("deltas", onDeltaReceived);

  async function fetchRemainingDeltas(lastKnownSequencedNumber: number) 
  {
    const summaryContent = await summary;

    if (lastKnownSequencedNumber > summaryContent.sequenceNumber + 1) 
    {
      const first = summaryContent.sequenceNumber + 1;
      const last = lastKnownSequencedNumber - 1;

      console.log(`Loading missing deltas: [${first} - ${last}]`);

      const deltas = await deltaService.getDeltas(first, last);

      receivedDeltas.unshift(...deltas);
    }
    else 
    {
      const countBefore = receivedDeltas.length;
      receivedDeltas = receivedDeltas.filter(it => it.sequenceNumber > summaryContent.sequenceNumber);
      if (receivedDeltas.length !== countBefore)
        console.log(`Dropped ${countBefore - receivedDeltas.length} deltas that were no longer needed`);
    }

    console.log(`All caught up, received ${receivedDeltas.length} deltas while catching up`);
    deferred.resolve({
      summary: summaryContent,
      deltas: receivedDeltas,
    });
  }

  deferred.promise.finally(() => connection.off("deltas", onDeltaReceived));

  if (abortSignal)
    abortSignal.onabort = () => deferred.reject();

  return deferred.promise;
}
