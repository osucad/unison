import { Audience } from "../services/Audience.js";
import { DocumentStorage } from "../services/DocumentStorage.js";

export interface IContainerServices {
  storage: DocumentStorage
  audience: Audience
}