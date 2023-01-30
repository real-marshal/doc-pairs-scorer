/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// noinspection SqlResolve

import DBService from '../DBService'
import Fastify, { FastifyInstance } from 'fastify'
import config from '@/app/config'

describe('DBService', () => {
  let f: FastifyInstance

  beforeAll(() => {
    f = Fastify(config)
  })

  afterAll(async () => {
    await f.close()
  })

  it('should have createCRUD function that returns object with CRUD operations', async () => {
    const DBServiceInstance = DBService(f)
    const CRUD = DBServiceInstance.createCRUD('db_service_crud_test')

    expect(CRUD).toContainAllKeys(['create', 'get', 'update', 'delete'])

    await DBServiceInstance.knex.raw(`
      create table db_service_crud_test
      (
        id integer primary key,
        test_text text
      )
    `)

    await CRUD.create({ testText: 'some text value' })

    const [createdRow] = await DBServiceInstance.knex.raw(`
      select *
      from db_service_crud_test
    `)

    expect(createdRow).toEqual({ id: 1, testText: 'some text value' })

    const readRow = await CRUD.get(1)

    expect(readRow).toEqual({ id: 1, testText: 'some text value' })

    await CRUD.update(1, { testText: 'new text value' })

    const [updatedRow] = await DBServiceInstance.knex.raw(`
      select *
      from db_service_crud_test
    `)

    expect(updatedRow).toEqual({ id: 1, testText: 'new text value' })

    await CRUD.delete(1)

    const [deletedRow] = await DBServiceInstance.knex.raw(`
      select *
      from db_service_crud_test
    `)

    expect(deletedRow).toBeUndefined()
  })
})
