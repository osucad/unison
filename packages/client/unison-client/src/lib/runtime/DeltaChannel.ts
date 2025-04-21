import { ISequencedDocumentMessage } from "@unison/shared-definitions";
import { UnisonRuntime } from "./UnisonRuntime.js";
import { DDS } from "@unison/dds-base";
import { IDeltaChannel } from "@unison/client-definitions";

export class DeltaChannel implements IDeltaChannel
{
  constructor(
    readonly runtime: UnisonRuntime,
    readonly id: string,
    readonly dds: DDS
  ) 
  {
  }

  private handler!: IDeltaHandler;

  setHandler(handler: IDeltaHandler) 
  {
    this.handler = handler;
  }

  process(message: ISequencedDocumentMessage, local: boolean): void 
  {
    this.handler.process(message, local);
  }
}

export interface IDeltaHandler 
{
  process(message: ISequencedDocumentMessage, local: boolean): void;
}