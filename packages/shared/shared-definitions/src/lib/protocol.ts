import { IClient } from "./client";

export enum MessageType 
{
  ClientJoin = "join",
  ClientLeave = "leave",
  Operation = "op",
  Signal = "signal"
}

export interface IDocumentMessage 
{
  clientSequenceNumber: number;
  type: string;
  contents: unknown;
}

export interface IDocumentSystemMessage extends IDocumentMessage 
{
  data: unknown;
}

export interface ISequencedDocumentMessage 
{
  clientId: string | null;
  sequenceNumber: number;
  clientSequenceNumber: number;
  type: string;
  contents: unknown;
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

export interface ISubmitOps extends IDocumentMessage 
{
  type: MessageType.Operation;
}


export interface ISignalMessage extends IDocumentMessage 
{
  type: MessageType.Signal;
  contents: unknown;
}

export type DocumentOperation =
    | IClientJoin
    | IClientLeave
    | ISubmitOps
    | ISignalMessage;
