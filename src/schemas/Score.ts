import type { DocumentId } from '@/schemas/Document'

export default interface Score {
  doc1: DocumentId
  doc2: DocumentId
  value: number
}

export interface ScoreInitializer {
  doc1: DocumentId
  doc2: DocumentId
  value: number
}

export interface ScoreMutator {
  doc1?: DocumentId
  doc2?: DocumentId
  value?: number
}
