export class ClientManager
{
  private readonly clients = new Map<string, IClientSequence>();

  count()
  {
    return this.clients.size;
  }

  get(clientId: string)
  {
    return this.clients.get(clientId);
  }

  upsertClient(
    clientId: string,
    clientSequenceNumber: number,
    timestamp: number,
    scopes: string[] = []
  ): boolean 
  {
    const client = this.clients.get(clientId);

    if (client) 
    {
      client.clientSequenceNumber = clientSequenceNumber;
      client.timestamp = timestamp;

      return false;
    }

    this.clients.set(clientId, {
      clientId,
      clientSequenceNumber,
      timestamp,
      scopes,
    });

    return true;
  }

  removeClient(clientId: string) 
  {
    return this.clients.delete(clientId);
  }

  public createCheckpoint(): IClientSequence[]
  {
    return structuredClone([...this.clients.values()]);
  }

  public restore(clients: IClientSequence[]) 
  {
    for (const client of clients)
    {
      this.upsertClient(
        client.clientId,
        client.clientSequenceNumber,
        client.timestamp,
        client.scopes,
      );
    }
  }
}

export interface IClientSequence 
{
  readonly clientId: string;
  clientSequenceNumber: number;
  timestamp: number;
  scopes: string[];
}