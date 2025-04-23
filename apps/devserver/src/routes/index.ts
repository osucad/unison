import { Router } from "express";
import { IUnisonServerResources } from "../services/IUnisonServerResources";
import { createDeltaRoutes } from "./deltas";
import { createSummaryRoutes } from "./summary";

export interface IRoutes 
{
  readonly summaries: Router;
  readonly deltas: Router;
}

export function createRoutes(
  resources: IUnisonServerResources,
) : IRoutes 
{
  return {
    summaries: createSummaryRoutes(resources),
    deltas: createDeltaRoutes(resources),
  };
}