import { IUser } from "./user";

export interface IClient {
  user: IUser
  scopes: string[]
}