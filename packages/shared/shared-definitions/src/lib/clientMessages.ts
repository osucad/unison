import { ISubmitOps } from "./protocol";
import { ConnectDocumentResult, IConnect } from "./connect";

export interface ClientMessages 
{
  connectDocument(
    options: IConnect,
    callback: (result: ConnectDocumentResult) => void,
  ): void;

  submitOps(documentId: string, ops: ISubmitOps): void;
}

