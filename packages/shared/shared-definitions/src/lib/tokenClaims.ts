import { UserDetails } from "./client.js";

export interface TokenClaims
{
  documentId?: string;
  user: UserDetails;
  scopes: string[];
}

export enum ScopeTypes 
{
  Read = "document:read",
  Write = "document:write",
  Create = "document:create",
}