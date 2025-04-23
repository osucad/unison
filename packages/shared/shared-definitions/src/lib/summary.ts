import { DDSAttributes } from "./dds.js";

export interface DocumentSummary
{
  readonly entryPoint: Record<string, string>;
  readonly entries: Record<string, DDSSummaryWithAttributes>;
  readonly sequenceNumber: number;
}

export interface DDSSummaryWithAttributes
{
  readonly attributes: DDSAttributes;
  readonly contents: unknown;
}