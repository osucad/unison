export interface ITokenProvider 
{
  getToken(documentId: string | undefined, scopes: string[]): Promise<ITokenResult>;
}

export interface ITokenResult 
{
  token: string;
}