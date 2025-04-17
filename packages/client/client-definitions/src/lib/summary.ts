import { DDSAttributes } from "./dds.js";

export interface IDocumentSummary 
{
  rootObjects: Record<string, string>;
  entries: Record<string, IObjectSummary>;
}

export interface IObjectSummary 
{
  attributes: DDSAttributes;
  contents: unknown;
}