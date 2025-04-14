import { IToken } from "@unison/protocol";
import { Result } from "neverthrow";

export interface ITokenVerifier {
  verifyToken(token: string): Result<IToken, unknown>
}