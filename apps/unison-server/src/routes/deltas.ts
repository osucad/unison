import { Router } from "express";
import { IUnisonServerResources } from "../services/IUnisonServerResources";

export function createDeltaRoutes({ deltaStorage }: IUnisonServerResources): Router {
  const router = Router()

  router.get('/api/v1/deltas/:id', async (req, res) => {
    const documentId = req.params.id
    const first = Number.parseInt(`${req.query.first}`)
    const last = req.query.last ? Number.parseInt(`${req.query.last}`) : undefined

    if (Number.isNaN(first) || (last !== undefined && Number.isNaN(last))) {
      res.sendStatus(400)
      return
    }

    const deltas = await deltaStorage.getDeltas(documentId, first, last)

    res.json(deltas)
  })

  return router
}