import { ISequencedDocumentMessage } from "@unison/protocol";
import { DeltaService } from "./DeltaService.js";
import { IDocumentDeltaService } from "@unison/client-definitions";

export class DocumentDeltaService implements IDocumentDeltaService 
{
  constructor(
    readonly documentId: string,
    private readonly deltaService: DeltaService,
  ) 
  {
  }

  async getDeltas(first: number, last?: number): Promise<ISequencedDocumentMessage[]> 
  {
    return this.deltaService.getDeltas(this.documentId, first, last);
  }
}