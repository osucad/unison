import { ISequencedDocumentMessage } from '@unison/shared-definitions'

export abstract class SharedStructure {
  abstract handle(
      message: ISequencedDocumentMessage,
      local: boolean,
      localOpMetadata: number,
  ): void
}