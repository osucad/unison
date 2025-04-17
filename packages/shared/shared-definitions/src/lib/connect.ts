export interface IConnect 
{
  version: string;
  documentId: string;
  token: string;
}

export type ConnectDocumentResult = ConnectDocumentSuccess | ConnectDocumentFailure;

export interface ConnectDocumentSuccess 
{
  success: true;
}

export type ConnectDocumentFailure =
    | VersionMismatch
    | InvalidToken
    | AlreadyConnected;

export interface VersionMismatch 
{
  success: false;
  error: "Version mismatch";
  detail: {
    expectedVersion: string;
  };
}

export function versionMismatch(expectedVersion: string): VersionMismatch 
{
  return {
    success: false,
    error: "Version mismatch",
    detail: {
      expectedVersion,
    },
  };
}

export interface InvalidToken 
{
  success: false;
  error: "Invalid token";
}

export function invalidToken(): InvalidToken 
{
  return {
    success: false,
    error: "Invalid token",
  };
}

export interface AlreadyConnected 
{
  success: false;
  error: "Already connected";
  detail: {
    documentId: string;
  };
}

export function alreadyConnected(documentId: string): AlreadyConnected 
{
  return {
    success: false,
    error: "Already connected",
    detail: {
      documentId,
    },
  };
}
