import { DeltaService } from "./DeltaService.js";

export class DocumentDeltaService 
{
  constructor(
    readonly documentId: string,
    private readonly deltaService: DeltaService,
  ) 
  {
  }

  async getDeltas(first: number, last?: number) 
  {
    return this.deltaService.getDeltas(this.documentId, first, last);
  }
}