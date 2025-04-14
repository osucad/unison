export interface IDocumentOperation {
  readonly type: string
}

export interface IClientInfo {
  readonly clientId: string
}

export interface IClientJoin extends IDocumentOperation {
  readonly type: 'join'
  readonly data: IClientInfo
}

export interface IClientLeave extends IDocumentOperation {
  readonly type: 'leave'
  readonly clientId: string
}

export interface ISubmitOps extends IDocumentOperation {
  readonly type: 'ops'
  readonly ops: string
  readonly clientSequenceNumber: number
}

export interface ISubmitSignal {
  readonly type: 'signal'
  readonly signal: {
    readonly type: string
    readonly content: string
  }
}