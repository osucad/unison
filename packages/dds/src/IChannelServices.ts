import { IChannelStorage } from "./IChannelStorage.js";
import { IDeltaConnection } from "./IDeltaConnection.js";

export interface IChannelServices {
  storage: IChannelStorage
  deltas: IDeltaConnection
}