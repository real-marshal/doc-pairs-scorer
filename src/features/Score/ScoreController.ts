import type { ScoreControllerFastifyInstance } from './index'
import { Type } from '@sinclair/typebox'
import type { DocumentId } from '@/schemas'
import { SortDirection } from '@/types/common'

export default function ScoreController(f: ScoreControllerFastifyInstance) {
  f.get(
    '/',
    {
      schema: {
        tags: ['score'],
        operationId: 'getScore',
        querystring: Type.Union([
          Type.Object({
            doc1: Type.Integer(),
            doc2: Type.Integer(),
          }),
          Type.Object({
            page: Type.Optional(Type.Integer()),
            count: Type.Optional(Type.Integer()),
            sortDirection: Type.Optional(Type.Enum(SortDirection)),
          }),
        ]),
        response: {
          200: Type.Union([
            Type.Object({
              doc1Id: Type.Integer(),
              doc1Content: Type.String(),
              doc2Id: Type.Integer(),
              doc2Content: Type.String(),
              value: Type.Integer(),
            }),
            Type.Array(
              Type.Object({
                doc1Id: Type.Integer(),
                doc1Content: Type.String(),
                doc2Id: Type.Integer(),
                doc2Content: Type.String(),
                value: Type.Integer(),
              })
            ),
          ]),
        },
      },
    },
    async ({ query }) => {
      return f.scoreRepository.get(
        'doc1' in query && 'doc2' in query
          ? {
              doc1: query.doc1 as DocumentId,
              doc2: query.doc2 as DocumentId,
            }
          : {
              page: query.page,
              count: query.count,
              sortDirection: query.sortDirection,
            }
      )
    }
  )

  f.post(
    '/',
    {
      schema: {
        tags: ['score'],
        operationId: 'createScore',
        body: Type.Object({
          doc1: Type.Integer(),
          doc2: Type.Integer(),
          value: Type.Integer(),
        }),
      },
    },
    async (request) => {
      await f.scoreRepository.create({
        ...request.body,
        doc1: request.body.doc1 as DocumentId,
        doc2: request.body.doc2 as DocumentId,
      })
    }
  )

  f.put(
    '/',
    {
      schema: {
        tags: ['score'],
        operationId: 'updateScore',
        querystring: Type.Object({
          doc1: Type.Integer(),
          doc2: Type.Integer(),
        }),
        body: Type.Object({
          value: Type.Optional(Type.Integer()),
        }),
      },
    },
    async (request) => {
      await f.scoreRepository.update(
        request.query.doc1 as DocumentId,
        request.query.doc2 as DocumentId,
        request.body
      )
    }
  )

  f.delete(
    '/',
    {
      schema: {
        tags: ['score'],
        operationId: 'deleteScore',
        querystring: Type.Object({
          doc1: Type.Integer(),
          doc2: Type.Integer(),
        }),
      },
    },
    async (request) => {
      await f.scoreRepository.delete(
        request.query.doc1 as DocumentId,
        request.query.doc2 as DocumentId
      )
    }
  )

  f.get(
    '/count',
    {
      schema: {
        tags: ['score'],
        operationId: 'countPages',
        response: {
          200: Type.Integer(),
        },
      },
    },
    async () => {
      return f.scoreRepository.countPages()
    }
  )
}
