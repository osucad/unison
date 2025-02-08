export interface IChannelStorage {
  getBlob(key: string): Promise<IBlob>;
}

export interface IBlob {
  content: string | Uint8Array;
}

export async function readAndParse<T>(storage: IChannelStorage, key: string): Promise<T> {
  const blob = await storage.getBlob(key)
  const buffer = typeof blob.content === 'string'
      ? Uint8Array.from(atob(blob.content), c => c.charCodeAt(0))
      : blob.content

  return JSON.parse(new TextDecoder().decode(buffer));
}