import type { AppFastifyInstance } from '@/app/app'
import type { Document, DocumentId, DocumentInitializer, DocumentMutator } from '@/schemas'

export default function DocumentRepository(f: AppFastifyInstance) {
  const { createCRUD, knex } = f.DBService

  const CRUD = createCRUD<Document, DocumentId, DocumentInitializer, DocumentMutator>('document')

  async function getRandomPairs(num = 100): Promise<Array<[Document, Document]>> {
    const results = await knex.raw<
      Array<{ id1: DocumentId; content1: string; id2: DocumentId; content2: string }>
    >(
      `
      select d1.id as id1, d1.content as content1, d2.id as id2, d2.content as content2
      from document as d1
      cross join document as d2 on d1.id < d2.id
      left join score as s on d1.id = s.doc_1 and d2.id = s.doc_2
      where s.doc_1 is null and s.doc_2 is null
      order by random()
      limit :num
    `,
      { num }
    )

    return results.map(({ id1, content1, id2, content2 }) => [
      { id: id1, content: content1 },
      { id: id2, content: content2 },
    ])
  }

  return {
    ...CRUD,
    getRandomPairs,
  }
}
