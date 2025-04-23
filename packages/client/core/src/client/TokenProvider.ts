export interface TokenProvider
{
  getToken(
    documentId?: string,
    scopes?: string[]
  ): Promise<TokenResponse>;
}

export interface TokenResponse
{
  token: string;
}