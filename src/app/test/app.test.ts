import Fastify, { FastifyInstance } from 'fastify'

jest.mock('../plugins', () => ({
  __esModule: true,
  default: async (f: FastifyInstance) => {
    await f.register(async (f) => {
      f.get('/test-unhandled', async () => {
        throw new Error('Uncaught exception: take a look at this DB data, hacker!')
      })

      f.get('/test-client-error', async (_, reply) => {
        return reply.badRequest('Validation failed')
      })

      f.get('/test', async () => {
        return 'test'
      })
    })
  },
}))

import config from '../config'
import app, { AppError } from '../app'
import { X_REQUEST_ID } from '@/constants/headers'

describe('app', () => {
  let f: FastifyInstance

  beforeAll(async () => {
    f = Fastify(config)
    await app(f)
    await f.listen()
  })

  afterAll(async () => {
    await f.close()
  })

  it('should safely handle uncaught errors in controllers', async () => {
    const logMock = jest.spyOn(f.log, 'error')
    const response = await f
      .inject()
      .get('api/test-unhandled')
      .headers({
        [X_REQUEST_ID]: 'uncaught-test-req-id',
      })

    expect(response.statusCode).toBe(500)
    expect(response.body).toMatchInlineSnapshot(
      `"{"statusCode":500,"error":"Internal Server Error","message":"Something bad happened."}"`
    )
    expect((logMock.mock.calls[0]?.[0] as unknown as AppError).message).toBe(
      'Uncaught exception: take a look at this DB data, hacker!'
    )
    expect((logMock.mock.calls[0]?.[0] as unknown as AppError).reqId).toBe('uncaught-test-req-id')
  })

  it(`should send the error to the client if it's a 4xx error`, async () => {
    const response = await f
      .inject()
      .get('api/test-client-error')
      .headers({
        [X_REQUEST_ID]: '4xx-client-req-id',
      })

    expect(response.statusCode).toBe(400)
    expect(response.body).toMatchInlineSnapshot(
      `"{"statusCode":400,"error":"Bad Request","message":"Validation failed"}"`
    )
    expect(response.headers[X_REQUEST_ID]).toBe('4xx-client-req-id')
  })

  it('should handle 404 error', async () => {
    const response = await f.inject().get('api/not-existing')

    expect(response.statusCode).toBe(404)
    expect(response.body).toMatchInlineSnapshot(
      `"{"message":"Route GET:/api/not-existing not found","error":"Not Found","statusCode":404}"`
    )
  })

  it(`should send x-request-id back with every request if it's provided`, async () => {
    const response = await f.inject().get('api/test').headers({
      'x-request-id': 'request-id',
    })

    expect(response.headers['x-request-id']).toBe('request-id')
  })

  it(`should generate x-request-id with every request if it's not provided`, async () => {
    const response = await f.inject().get('api/test')

    expect(response.headers['x-request-id']).toMatch(/req-\d+/)
  })
})
