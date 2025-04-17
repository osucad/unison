import { IDocumentSummary } from "./summary.js";

export interface IUnisonRuntime 
{
  createSummary(): IDocumentSummary;
}