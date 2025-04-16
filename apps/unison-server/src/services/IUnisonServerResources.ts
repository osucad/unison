import { IDeltaStorage } from "./IDeltaStorage";
import { IDocumentStorage } from "./IDocumentStorage";
import { OrdererService } from "./sequencer/OrdererService";
import { ITokenVerifier } from "./ITokenVerifier";

export interface IUnisonServerResources 
{
  ordererService: OrdererService;
  tokenVerifier: ITokenVerifier;
  deltaStorage: IDeltaStorage;
  documentStorage: IDocumentStorage;
}