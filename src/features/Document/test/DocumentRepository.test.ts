import Fastify, { FastifyInstance } from 'fastify'
import config from '@/app/config'
import registerDBPlugin from '../../DB'
import DocumentRepository from '../DocumentRepository'
import ScoreRepository from '@/features/Score/ScoreRepository'
import type { DocumentId } from '@/schemas'

describe('DocumentRepository', () => {
  let f: FastifyInstance

  beforeAll(async () => {
    f = Fastify(config)
    await registerDBPlugin(f)
  })

  afterAll(async () => {
    await f.close()
  })

  afterEach(async () => {
    await f.DBService.knex.raw(`
      delete from score
    `)

    await f.DBService.knex.raw(`
      delete from document
    `)
  })

  it('should have CRUD functions', () => {
    const createCRUDMock = jest.spyOn(f.DBService, 'createCRUD')
    const documentRepository = DocumentRepository(f)

    expect(documentRepository).toMatchObject(createCRUDMock.mock.results[0]?.value)
  })

  it('should have getRandomPairs function that returns unique unscored pairs', async () => {
    const documentRepository = DocumentRepository(f)
    const scoreRepository = ScoreRepository(f)

    await documentRepository.create({ content: 'document 1' })
    await documentRepository.create({ content: 'document 2' })
    await documentRepository.create({ content: 'document 3' })

    await scoreRepository.create({ doc1: 1 as DocumentId, doc2: 2 as DocumentId, value: 5 })

    const pairs = await documentRepository.getRandomPairs()

    expect(pairs.sort(([{ id: a }], [{ id: b }]) => a - b)).toMatchInlineSnapshot(`
      [
        [
          {
            "content": "document 1",
            "id": 1,
          },
          {
            "content": "document 3",
            "id": 3,
          },
        ],
        [
          {
            "content": "document 2",
            "id": 2,
          },
          {
            "content": "document 3",
            "id": 3,
          },
        ],
      ]
    `)
  })
})
