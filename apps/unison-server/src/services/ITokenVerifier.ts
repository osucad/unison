import { IToken } from "@unison/shared-definitions";
import { Result } from "neverthrow";

export interface ITokenVerifier 
{
  verifyToken(token: string): Result<IToken, unknown>;
}