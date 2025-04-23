import { DocumentMessage, SequencedMessage } from "@unison/shared-definitions";

export interface IDeltaStorage 
{
  getDeltas(documentId: string, first: number, last?: number): Promise<SequencedMessage<DocumentMessage>[]>;

  append(documentId: string, deltas: SequencedMessage<DocumentMessage>[]): Promise<void>;
}