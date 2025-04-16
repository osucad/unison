import { Request, RequestHandler, Response } from "express";
import { ITokenVerifier } from "../services/ITokenVerifier";

export function requireDocumentScopes(
  tokenVerifier: ITokenVerifier,
  ...scopes: string[]): RequestHandler 
{
  return (req: Request, res: Response, next: () => void) => 
  {
    if (isTokenValid(req, tokenVerifier, req.params.documentId, scopes))
      next();
    else
      res.sendStatus(401);
  };
}

export function requireScopes(
  tokenVerifier: ITokenVerifier,
  ...scopes: string[]): RequestHandler 
{
  return (req: Request, res: Response, next: () => void) => 
  {
    if (isTokenValid(req, tokenVerifier, undefined, scopes))
      next();
    else
      res.sendStatus(401);
  };
}

function isTokenValid(
  req: Request,
  tokenVerifier: ITokenVerifier,
  documentId: string | undefined,
  requiredScopes: string[],
): boolean 
{
  const bearerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.substring("Bearer ".length)
    : undefined;

  if (!bearerToken)
    return false;

  const result = tokenVerifier.verifyToken(bearerToken);

  if (result.isErr())
    return false;

  const token = result.value;

  if (documentId !== undefined && token.documentId !== documentId)
    return false;

  return requiredScopes.every(scope => token.scopes.includes(scope));
}