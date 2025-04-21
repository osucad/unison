import { ISequencedDocumentMessage } from "@unison/shared-definitions";

export interface IDeltaService 
{
  getDeltas(documentId: string, start: number, end?: number): Promise<ISequencedDocumentMessage[]>;
}

export interface IDocumentDeltaService 
{
  getDeltas(start: number, end?: number): Promise<ISequencedDocumentMessage[]>;
}

export interface IDeltaChannel 
{
  setHandler(handler: IDeltaHandler): void;

  process(message: ISequencedDocumentMessage, local: boolean): void;
}

export interface IDeltaHandler 
{
  process(message: ISequencedDocumentMessage, local: boolean): void;
}