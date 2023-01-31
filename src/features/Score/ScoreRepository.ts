import type { AppFastifyInstance } from '@/app/app'
import type { DocumentId, ScoreInitializer, ScoreMutator } from '@/schemas'
import { DEFAULT_PAGE_COUNT } from '@/constants/etc'
import { SortDirection } from '@/types/common'

export default function ScoreRepository(f: AppFastifyInstance) {
  const table = 'score'
  const { knex } = f.DBService

  async function create(values: ScoreInitializer): Promise<void> {
    return knex(table).insert(values)
  }

  async function update(doc1: DocumentId, doc2: DocumentId, values: ScoreMutator): Promise<void> {
    await knex(table).update(values).where({ doc1, doc2 })
  }

  async function _delete(doc1: DocumentId, doc2: DocumentId): Promise<void> {
    await knex(table).delete().where({ doc1, doc2 })
  }

  async function get({
    page = 1,
    count = DEFAULT_PAGE_COUNT,
    sortDirection = SortDirection.DESC,
    doc1,
    doc2,
  }: {
    page?: number | undefined
    count?: number | undefined
    sortDirection?: SortDirection | undefined
    doc1?: DocumentId | undefined
    doc2?: DocumentId | undefined
  }) {
    const results = await knex.raw<
      Array<{
        doc1Id: DocumentId
        doc1Content: string
        doc2Id: DocumentId
        doc2Content: string
        value: number
      }>
    >(
      `
      select d1.id as doc1Id,
             d1.content as doc1Content,
             d2.id as doc2Id,
             d2.content as doc2Content,
             value
      from score
      left join document d1 on score.doc_1 = d1.id
      left join document d2 on score.doc_2 = d2.id
      ${
        doc1 && doc2
          ? `
        where doc_1 = :doc1 and doc_2 = :doc2
        `
          : `
        order by doc_1 ${sortDirection}, doc_2 ${sortDirection}
        limit :count
        offset :offset
        `
      }
    `,
      {
        offset: (page - 1) * count,
        count,
        doc1,
        doc2,
      }
    )

    return doc1 && doc2 ? results[0] : results
  }

  async function countPages(pageCount = DEFAULT_PAGE_COUNT) {
    const [countRow] = await knex.raw<[{ count: number }]>(`
      select count(*) from score
    `)

    return Math.ceil(countRow!.count / pageCount)
  }

  return {
    create,
    get,
    update,
    delete: _delete,
    countPages,
  }
}
