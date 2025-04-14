import { ITokenProvider, ITokenResult } from "./ITokenProvider.js";
import { IToken, IUser } from "@unison/protocol"

export class InsecureTokenProvider implements ITokenProvider {
  async getToken(documentId: string, scopes: string[]): Promise<ITokenResult> {
    const token: IToken = {
      documentId,
      scopes,
      user: {
        id: 'dummy-user',
        username: 'testuser'
      } as IUser
    }

    return {
      token: JSON.stringify(token)
    }
  }
}