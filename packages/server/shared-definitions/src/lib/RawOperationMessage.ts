import { DocumentOperation } from "@unison/shared-definitions";

export interface RawOperationMessage
{
  readonly clientId: string | null;
  readonly documentId: string;
  readonly timestamp: number;
  readonly operation: DocumentOperation;
}