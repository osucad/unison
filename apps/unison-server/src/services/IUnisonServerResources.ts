import { IDeltaStorage } from "./IDeltaStorage";
import { IDocumentStorage } from "./IDocumentStorage";
import { RoomService } from "./sequencer/RoomService";
import { ITokenVerifier } from "./ITokenVerifier";

export interface IUnisonServerResources 
{
  roomService: RoomService;
  tokenVerifier: ITokenVerifier;
  deltaStorage: IDeltaStorage;
  documentStorage: IDocumentStorage;
}