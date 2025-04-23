import { IUser } from "./user.js";

export interface IClient 
{
  user: IUser;
  scopes: string[];
}