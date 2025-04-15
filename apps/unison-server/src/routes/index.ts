import { Router } from "express";
import { IUnisonServerResources } from "../services/IUnisonServerResources";
import { createSummaryRoutes } from "./summary";

export interface IRoutes {
  readonly summaries: Router
}

export function createRoutes(
    resources: IUnisonServerResources,
) {
  return {
    summaries: createSummaryRoutes(resources)
  }
}