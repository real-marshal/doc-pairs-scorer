import type { AppFastifyInstance } from '@/app/app'
import ScoreController from './ScoreController'
import ScoreRepository from './ScoreRepository'

export interface ScoreControllerFastifyInstance extends AppFastifyInstance {
  scoreRepository: ReturnType<typeof ScoreRepository>
}

async function ScorePlugin(f: AppFastifyInstance) {
  f.decorate('scoreRepository', ScoreRepository(f))

  ScoreController(f as ScoreControllerFastifyInstance)
}

export default async function registerScorePlugin(f: AppFastifyInstance) {
  return f.register(ScorePlugin, { prefix: 'score' })
}
