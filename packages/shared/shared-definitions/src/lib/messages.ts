import { Connect, ConnectDocumentResult } from "./connect.js";
import { DocumentMessage, DocumentOperation, SequencedMessage } from "./document.js";

export interface ClientMessages
{
  connectDocument(
    options: Connect,
    callback: (result: ConnectDocumentResult) => void,
  ): void;

  submitOps(documentId: string, ops: DocumentOperation): void;
}



export interface ServerMessages
{
  deltas(documentId: string, deltas: SequencedMessage<DocumentMessage>[]): void;
}

