import type { AppFastifyInstance } from '@/app/app'
import DocumentController from './DocumentController'
import DocumentRepository from './DocumentRepository'

export interface DocumentControllerFastifyInstance extends AppFastifyInstance {
  documentRepository: ReturnType<typeof DocumentRepository>
}

async function DocumentPlugin(f: AppFastifyInstance) {
  f.decorate('documentRepository', DocumentRepository(f))

  DocumentController(f as DocumentControllerFastifyInstance)
}

export default async function registerDocumentPlugin(f: AppFastifyInstance) {
  return f.register(DocumentPlugin, { prefix: 'document' })
}
