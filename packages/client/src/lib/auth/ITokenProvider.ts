export interface ITokenProvider {
  getToken(documentId: string, scopes: string[]): Promise<ITokenResult>
}

export interface ITokenResult {
  token: string
}