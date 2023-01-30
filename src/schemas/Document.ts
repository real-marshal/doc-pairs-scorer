export type DocumentId = number & { __brand: 'DocumentId' }

export default interface Document {
  id: DocumentId
  content: string
}

export interface DocumentInitializer {
  id?: DocumentId
  content: string
}

export interface DocumentMutator {
  id?: DocumentId
  content?: string
}
