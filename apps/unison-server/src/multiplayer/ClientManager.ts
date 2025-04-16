export class ClientManager 
{
  readonly clients = new Map<string, ClientInfo>();

  get count() 
  {
    return this.clients.size;
  }

  upsertClient(
    clientId: string,
    clientSequenceNumber: number,
    scopes: string[] = []
  ): boolean 
  {
    const client = this.clients.get(clientId);

    if (client) 
    {
      client.clientSequenceNumber = clientSequenceNumber;

      return false;
    }

    this.clients.set(clientId, {
      clientId,
      clientSequenceNumber,
      scopes: scopes
    });

    return true;
  }

  removeClient(clientId: string) 
  {
    return this.clients.delete(clientId);
  }

  get(clientId: string) 
  {
    return this.clients.get(clientId);
  }
}

export interface ClientInfo 
{
  readonly clientId: string;
  clientSequenceNumber: number;
  scopes: string[];
}