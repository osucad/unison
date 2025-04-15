import { IUnisonServerResources } from "./IUnisonServerResources";

export function writeDeltasToStorage(
    { ordererService, deltaStorage }: IUnisonServerResources
) {
  ordererService.on('deltasProduced', (documentId, deltas) => {
    deltaStorage.append(documentId, deltas)
  })
}