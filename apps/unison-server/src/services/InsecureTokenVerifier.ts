import { IToken } from "@unison/protocol";
import { ITokenVerifier } from "./ITokenVerifier";
import { fromThrowable, Result } from "neverthrow";

/**
 * Token verifier that treats the token as a json string
 *
 * @remarks
 * Do NOT use in production!
 */
export class InsecureTokenVerifier implements ITokenVerifier {
  verifyToken(token: string): Result<IToken, unknown> {
    return fromThrowable(JSON.parse)(token)
  }
}