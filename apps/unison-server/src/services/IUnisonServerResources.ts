import { OrdererService } from "./sequencer/OrdererService";
import { ITokenVerifier } from "./ITokenVerifier";

export interface IUnisonServerResources {
  ordererService: OrdererService
  tokenVerifier: ITokenVerifier
}