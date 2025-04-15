import { IToken } from "@unison/protocol";
import { ITokenVerifier } from "./ITokenVerifier";
import { err, fromThrowable, ok, Result } from "neverthrow";

const safeParse = fromThrowable(JSON.parse)

/**
 * Token verifier that treats the token as a json string
 *
 * @remarks
 * Do NOT use in production!
 */
export class InsecureTokenVerifier implements ITokenVerifier {
  verifyToken(token: string): Result<IToken, unknown> {
    return safeParse(token)
        .andThen(token => token.insecureToken ? ok(token.insecureToken) : err())
  }
}