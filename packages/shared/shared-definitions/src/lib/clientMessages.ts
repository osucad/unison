import { IDocumentDelta } from "./protocol.js";
import { ConnectDocumentResult, IConnect } from "./connect.js";

export interface ClientMessages 
{
  connectDocument(
    options: IConnect,
    callback: (result: ConnectDocumentResult) => void,
  ): void;

  submitOps(documentId: string, ops: IDocumentDelta): void;
}

