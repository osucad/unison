import { ITokenProvider, ITokenResult } from "./ITokenProvider.js";
import { IToken, IUser } from "@unison/shared-definitions";

export class InsecureTokenProvider implements ITokenProvider
{
  async getToken(documentId: string | undefined, scopes: string[]): Promise<ITokenResult> 
  {
    const token: IToken  = {
      documentId,
      scopes,
      user: {
        id: "dummy-user",
        username: "testuser"
      } as IUser
    };

    return {
      token: JSON.stringify({ insecureToken: token })
    };
  }
}