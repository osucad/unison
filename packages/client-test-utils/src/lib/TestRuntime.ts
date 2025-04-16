import { IDocumentSummary, IUnisonRuntime } from "@unison/client-definitions";

export class TestRuntime implements IUnisonRuntime 
{
  createSummary(): IDocumentSummary 
  {
    throw new Error("Method not implemented.");
  }
}
