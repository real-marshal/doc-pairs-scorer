import type { AppFastifyInstance } from './app'
import registerDBPlugin from '@/features/DB'
import registerDocumentPlugin from '@/features/Document'
import registerScorePlugin from '@/features/Score'

export default async function registerPlugins(f: AppFastifyInstance) {
  void registerDBPlugin(f)
  void registerDocumentPlugin(f)
  void registerScorePlugin(f)
}
