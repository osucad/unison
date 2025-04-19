import { ClientMessages, ConnectDocumentFailure, IConnect, invalidToken, PROTOCOL_VERSION, ScopeTypes, ServerMessages, versionMismatch } from "@unison/shared-definitions";
import { err, ok, Result } from "neverthrow";
import { Socket } from "socket.io";
import { IUnisonServerResources } from "../services/IUnisonServerResources";
import { OrdererConnection } from "../services/sequencer/OrdererConnection";

export async function connectDocument(
  client: Socket<ClientMessages, ServerMessages>,
  options: IConnect,
  { ordererService, tokenVerifier }: IUnisonServerResources,
): Promise<Result<OrdererConnection, ConnectDocumentFailure>> 
{
  const { documentId } = options;

  if (options.version !== PROTOCOL_VERSION)
    return err(versionMismatch(PROTOCOL_VERSION));

  const tokenResult = tokenVerifier.verifyToken(options.token);

  if (tokenResult.isErr())
    return err(invalidToken());

  const token = tokenResult.value;

  if (token.documentId !== documentId)
    return err(invalidToken());

  if (!token.scopes.includes(ScopeTypes.Read))
    return err(invalidToken());

  const connection = await ordererService.getConnection(client.id, documentId);

  client.join(documentId);

  const {user, scopes } = token;

  connection.connect({ user, scopes });

  return ok(connection);
}

