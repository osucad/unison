import { IUser } from "./user.js";

export interface IToken 
{
  documentId?: string;
  user: IUser;
  scopes: string[];
}

export enum ScopeTypes 
{
  Read = "document:read",
  Write = "document:write",
  Create = "document:create",
}