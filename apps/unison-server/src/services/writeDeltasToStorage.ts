import { IUnisonServerResources } from "./IUnisonServerResources";

export function writeDeltasToStorage(
  { roomService, deltaStorage }: IUnisonServerResources
) 
{
  roomService.on("deltasProduced", (documentId, deltas) =>
  {
    deltaStorage.append(documentId, deltas);
  });
}