import { ClientDetail } from "./client.js";

/**
 * High level message targeting an entire document
 */
export type DocumentMessage = ClientJoin | ClientLeave | DocumentOperation;

export interface BaseDocumentMessage 
{
  type: string;
  contents: unknown;
  clientSequenceNumber: number;
}

export interface ClientJoin extends BaseDocumentMessage
{
  readonly type: "join";
  readonly contents: {
    readonly clientId: string;
    readonly detail: ClientDetail;
  };
}

export interface ClientLeave extends BaseDocumentMessage
{
  readonly type: "leave";
  readonly contents: {
    readonly clientId: string;
  };
}

export interface DocumentOperation extends BaseDocumentMessage
{
  readonly type: "op";
  readonly clientSequenceNumber: number;
  readonly contents: RuntimeOperation[];
}

export interface RuntimeOperation
{
  readonly target: string | null;
  readonly contents: unknown;
}

export interface SequencedMessage<T = unknown>
{
  readonly clientId: string | null;
  readonly sequenceNumber: number;
  readonly clientSequenceNumber: number;
  readonly contents: T;
  readonly type: string;
}