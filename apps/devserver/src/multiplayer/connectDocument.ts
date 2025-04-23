import { ClientMessages, ConnectDocumentFailure, Connect, invalidToken, PROTOCOL_VERSION, ScopeTypes, ServerMessages, versionMismatch } from "@unison/shared-definitions";
import { err, ok, Result } from "neverthrow";
import { Socket } from "socket.io";
import { IUnisonServerResources } from "../services/IUnisonServerResources";
import { RoomConnection } from "../services/multiplayer/RoomConnection";

export async function connectDocument(
  client: Socket<ClientMessages, ServerMessages>,
  options: Connect,
  { roomService, tokenVerifier }: IUnisonServerResources,
): Promise<Result<RoomConnection, ConnectDocumentFailure>> 
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

  const connection = await roomService.getConnection({
    documentId,
    clientId: client.id
  });

  client.join(documentId);

  const { user, scopes } = token;

  connection.connect({ user, scopes });

  return ok(connection);
}

