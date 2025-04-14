import { Socket } from "socket.io";
import { ClientMessages, ConnectDocumentFailure, IConnect, invalidToken, MessageType, PROTOCOL_VERSION, ScopeTypes, ServerMessages, versionMismatch } from "@unison/protocol";
import { IUnisonServerResources } from "../services/IUnisonServerResources";
import { err, ok, Result } from "neverthrow";
import { OrdererConnection } from "../services/sequencer/OrdererConnection";

export async function connectDocument(
    client: Socket<ClientMessages, ServerMessages>,
    options: IConnect,
    { ordererService, tokenVerifier }: IUnisonServerResources,
): Promise<Result<OrdererConnection, ConnectDocumentFailure>> {
  const { documentId } = options

  if (options.version !== PROTOCOL_VERSION)
    return err(versionMismatch(PROTOCOL_VERSION))

  const tokenResult = tokenVerifier.verifyToken(options.token)

  if (tokenResult.isErr())
    return err(invalidToken())

  const token = tokenResult.value

  if (token.documentId !== documentId)
    return err(invalidToken())

  if (!token.scopes.includes(ScopeTypes.Read))
    return err(invalidToken())

  const connection = ordererService.getConnection(documentId)

  client.join(documentId)

  connection.send({
    clientId: null,
    timestamp: Date.now(),
    operation: {
      type: MessageType.ClientJoin,
      clientSequenceNumber: -1,
      contents: {
        clientId: client.id,
        detail: {
          user: token.user,
          scopes: token.scopes,
        }
      },
    },
  })

  return ok(connection)
}

