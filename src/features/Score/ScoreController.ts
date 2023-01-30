import type { ScoreControllerFastifyInstance } from './index'
import { Type } from '@sinclair/typebox'
import type { DocumentId } from '@/schemas'

export default function ScoreController(f: ScoreControllerFastifyInstance) {
  f.get(
    '/',
    {
      schema: {
        tags: ['score'],
        operationId: 'getScore',
        querystring: Type.Object({
          doc1: Type.Integer(),
          doc2: Type.Integer(),
        }),
        response: {
          200: Type.Object({
            doc1: Type.Integer(),
            doc2: Type.Integer(),
            value: Type.Integer(),
          }),
        },
      },
    },
    async (request) => {
      return f.scoreRepository.get(
        request.query.doc1 as DocumentId,
        request.query.doc2 as DocumentId
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
}
