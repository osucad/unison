import { Router } from "express";
import { IUnisonServerResources } from "../services/IUnisonServerResources";

export function createSummaryRoutes(resources: IUnisonServerResources,): Router {
  const router = Router()

  router.get('/api/v1/documents/:id/summary/latest', (req, res) => {
    // TODO
    res.json({
      sequenceNumber: 0,
      contents: {
        foo: 'bar'
      }
    })
  })

  return router
}