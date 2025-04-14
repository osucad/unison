import { Socket } from "socket.io";
import { ClientMessages, ConnectDocumentOptions, ConnectDocumentResult, ServerMessages } from "@unison/protocol";

export async function connectDocument(
    client: Socket<ClientMessages, ServerMessages>,
    options: ConnectDocumentOptions,
): Promise<ConnectDocumentResult> {
  const { documentId } = options

  // TODO: add token check
  // TODO: add version check

  client.join(documentId)

  return { success: true }
}