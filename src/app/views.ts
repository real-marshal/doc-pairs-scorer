import type { AppFastifyInstance } from './app'
import { Type } from '@sinclair/typebox'
import { DEFAULT_PAGE_COUNT } from '@/constants/etc'

export default async function registerViews(f: AppFastifyInstance) {
  f.get('/', async (_, reply) => {
    return reply.redirect('/documents')
  })

  f.get(
    '/documents',
    {
      schema: {
        querystring: Type.Object({
          page: Type.Optional(Type.Integer()),
        }),
      },
    },
    async (request, reply) => {
      return reply.view('documents.ejs', {
        page: request.query.page ?? 1,
        defaultPageCount: DEFAULT_PAGE_COUNT,
      })
    }
  )

  f.get(
    '/scores',
    {
      schema: {
        querystring: Type.Object({
          page: Type.Optional(Type.Integer()),
        }),
      },
    },
    async (request, reply) => {
      return reply.view('scores.ejs', {
        page: request.query.page ?? 1,
        defaultPageCount: DEFAULT_PAGE_COUNT,
      })
    }
  )
}
