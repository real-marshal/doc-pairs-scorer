/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Fastify, { FastifyInstance } from 'fastify'
import config from '@/app/config'
import registerDBPlugin from '../../DB'
import ScoreRepository from '../ScoreRepository'
import type { DocumentId } from '@/schemas'
import DocumentRepository from '@/features/Document/DocumentRepository'

describe('ScoreRepository', () => {
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

  it('should have CRUD functions', async () => {
    const scoreRepository = ScoreRepository(f)
    const documentRepository = DocumentRepository(f)

    await documentRepository.create({ content: 'doc1' })
    await documentRepository.create({ content: 'doc2' })

    const testScore = { doc1: 1 as DocumentId, doc2: 2 as DocumentId, value: 4 }

    await scoreRepository.create(testScore)

    const [createdRow] = await f.DBService.knex.raw(`
      select *
      from score
    `)

    expect(createdRow).toEqual(testScore)

    const readRow = await scoreRepository.get(1 as DocumentId, 2 as DocumentId)

    expect(readRow).toEqual(testScore)

    await scoreRepository.update(1 as DocumentId, 2 as DocumentId, { value: 7 })

    const [updatedRow] = await f.DBService.knex.raw(`
      select *
      from score
    `)

    expect(updatedRow).toEqual({ ...testScore, value: 7 })

    await scoreRepository.delete(1 as DocumentId, 2 as DocumentId)

    const [deletedRow] = await f.DBService.knex.raw(`
      select *
      from score
    `)

    expect(deletedRow).toBeUndefined()
  })
})
