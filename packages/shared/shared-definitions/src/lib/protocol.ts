import { IClient } from "./client";

export enum MessageType 
{
  ClientJoin = "join",
  ClientLeave = "leave",
  Delta = "delta",
  Signal = "signal"
}

export interface IDocumentMessage<T = unknown>
{
  clientSequenceNumber: number;
  type: string;
  contents: T;
}

export interface ISequencedDocumentMessage 
{
  clientId: string | null;
  sequenceNumber: number;
  clientSequenceNumber: number;
  type: MessageType;
  operation: unknown;
  data?: string;
}

export interface IClientJoin extends IDocumentMessage
{
  type: MessageType.ClientJoin;
  contents: {
    clientId: string;
    detail: IClient;
  };
}

export interface IClientLeave extends IDocumentMessage
{
  type: MessageType.ClientLeave;
  contents: {
    clientId: string;
  };
}

export interface IDocumentDelta extends IDocumentMessage<IOperation[]>
{
  type: MessageType.Delta;
}

export interface IOperation
{
  target: string | null;
  contents: unknown;
}


export interface ISignalMessage extends IDocumentMessage 
{
  type: MessageType.Signal;
  contents: unknown;
}

export type DocumentMessage =
    | IClientJoin
    | IClientLeave
    | IDocumentDelta
    | ISignalMessage;
