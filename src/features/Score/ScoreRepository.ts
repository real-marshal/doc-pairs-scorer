import type { AppFastifyInstance } from '@/app/app'
import type { DocumentId, Score, ScoreInitializer, ScoreMutator } from '@/schemas'

export default function ScoreRepository(f: AppFastifyInstance) {
  const table = 'score'
  const { knex } = f.DBService

  async function create(values: ScoreInitializer): Promise<void> {
    return knex(table).insert(values)
  }

  async function get(doc1: DocumentId, doc2: DocumentId): Promise<Score | undefined> {
    const results = await knex(table).select().where({ doc1, doc2 })
    return results[0] as Score
  }

  async function update(doc1: DocumentId, doc2: DocumentId, values: ScoreMutator): Promise<void> {
    await knex(table).update(values).where({ doc1, doc2 })
  }

  async function _delete(doc1: DocumentId, doc2: DocumentId): Promise<void> {
    await knex(table).delete().where({ doc1, doc2 })
  }

  return {
    create,
    get,
    update,
    delete: _delete,
  }
}
