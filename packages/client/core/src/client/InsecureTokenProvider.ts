import { ScopeTypes, TokenClaims, UserDetails } from "@unison/shared-definitions";
import { TokenProvider, TokenResponse } from "./TokenProvider.js";

export class InsecureTokenProvider implements TokenProvider 
{
  async getToken(
    documentId?: string,
    scopes: string[] = [ScopeTypes.Read, ScopeTypes.Write, ScopeTypes.Create]
  ): Promise<TokenResponse>
  {
    const token: TokenClaims = {
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