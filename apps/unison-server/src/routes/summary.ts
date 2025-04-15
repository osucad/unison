import { Router } from "express";
import { IUnisonServerResources } from "../services/IUnisonServerResources";

export function createSummaryRoutes({ documentStorage }: IUnisonServerResources,): Router {
  const router = Router()

  router.post('/api/v1/documents', async (req, res) => {
    const summary = req.body.summary

    // TODO: add validation & sanity checks

    const documentId = await documentStorage.createDocument(summary)

    res.status(301).json({ id: documentId })
  })

  router.get('/api/v1/documents/:documentId/summary/:summary', async (req, res) => {
    const documentId = req.params.documentId
    let sequenceNumber: number | 'latest'

    if (req.params.summary === 'latest') {
      sequenceNumber = req.params.summary
    } else {
      sequenceNumber = Number.parseInt(req.params.summary)
      if (!Number.isNaN(sequenceNumber)) {
        res.sendStatus(400)
        return
      }
    }

    const summary = await documentStorage.getSummary(documentId, sequenceNumber)

    if (!summary) {
      res.sendStatus(404)
      return
    }

    res.json(summary)
  })

  return router
}