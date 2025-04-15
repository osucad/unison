import { ScopeTypes } from "@unison/protocol";
import { Router } from "express";
import { requireDocumentScopes } from "../middlewares/scopes";
import { IUnisonServerResources } from "../services/IUnisonServerResources";

export function createDeltaRoutes({ deltaStorage, tokenVerifier }: IUnisonServerResources): Router {
  const router = Router()

  router.get(
      '/api/v1/deltas/:documentId',
      requireDocumentScopes(tokenVerifier, ScopeTypes.Read),
      async (req, res) => {
        const documentId = req.params.documentId
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