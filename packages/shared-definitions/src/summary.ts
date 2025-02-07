export interface ISummaryTree {
  type: 'tree'
  tree: { [key: string]: SummaryObject }
}

export interface ISummaryBlob {
  type: 'blob'
  content: string
  encoding: 'utf-8' | 'base64'
}

export type SummaryObject = ISummaryTree
