import { IDocumentSummary, ScopeTypes } from "@unison/shared-definitions";
import { Router } from "express";
import { requireDocumentScopes, requireScopes } from "../middlewares/scopes";
import { IUnisonServerResources } from "../services/IUnisonServerResources";

export function createSummaryRoutes({ tokenVerifier, documentStorage }: IUnisonServerResources,): Router 
{
  const router = Router();

  router.post(
    "/documents",
    requireScopes(tokenVerifier, ScopeTypes.Create),
    async (req, res) => 
    {
      const summary = req.body.summary;

      // TODO: add validation & sanity checks

      const documentId = await documentStorage.createDocument(summary);

      res.status(301).json({ id: documentId });
    });

  router.post(
    "/documents/:documentId/summarize",
    requireDocumentScopes(tokenVerifier, ScopeTypes.Write),
    async (req, res) => 
    {
      const documentId = req.params.documentId;
      const summary: IDocumentSummary = req.body.summary;

      await documentStorage.appendSummary(documentId, summary);

      res.status(301).json({
        id: documentId,
        sequenceNumber: summary.sequenceNumber
      });
    });

  router.get(
    "/documents/:documentId/summary/:summary",
    requireDocumentScopes(tokenVerifier, ScopeTypes.Read),
    async (req, res) => 
    {
      const documentId = req.params.documentId;
      let sequenceNumber: number | "latest";

      if (req.params.summary === "latest") 
      {
        sequenceNumber = req.params.summary;
      }
      else 
      {
        sequenceNumber = Number.parseInt(req.params.summary);
        if (!Number.isNaN(sequenceNumber)) 
        {
          res.sendStatus(400);
          return;
        }
      }

      const summary = await documentStorage.getSummary(documentId, sequenceNumber);

      if (!summary) 
      {
        res.sendStatus(404);
        return;
      }

      res.json(summary);
    });

  return router;
}