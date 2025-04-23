import { ITokenProvider, ITokenResult } from "./ITokenProvider.js";
import { TokenClaims, UserDetails } from "@unison/shared-definitions";

export class InsecureTokenProvider implements ITokenProvider
{
  async getToken(documentId: string | undefined, scopes: string[]): Promise<ITokenResult> 
  {
    const token: TokenClaims  = {
      documentId,
      scopes,
      user: {
        id: "dummy-user",
        username: "testuser"
      } as UserDetails
    };

    return {
      token: JSON.stringify({ insecureToken: token })
    };
  }
}