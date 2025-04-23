export interface ClientDetail
{
  readonly user: UserDetails;
  readonly scopes: string[];
}

export interface UserDetails extends Record<string, unknown>
{
  id: string;
}