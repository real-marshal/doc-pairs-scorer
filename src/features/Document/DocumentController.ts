import type { DocumentControllerFastifyInstance } from './index'
import { Type } from '@sinclair/typebox'
import type { DocumentId } from '@/schemas'

export default function DocumentController(f: DocumentControllerFastifyInstance) {
  f.get(
    '/:id',
    {
      schema: {
        tags: ['document'],
        operationId: 'getDocument',
        params: Type.Object({
          id: Type.Integer(),
        }),
        response: {
          200: Type.Object({
            id: Type.Integer(),
            content: Type.String(),
          }),
        },
      },
    },
    async (request) => {
      return f.documentRepository.get(request.params.id as DocumentId)
    }
  )

  f.post(
    '/',
    {
      schema: {
        tags: ['document'],
        operationId: 'createDocument',
        body: Type.Object({
          content: Type.String(),
        }),
      },
    },
    async (request) => {
      await f.documentRepository.create(request.body)
    }
  )

  f.put(
    '/',
    {
      schema: {
        tags: ['document'],
        operationId: 'updateDocument',
        params: Type.Object({
          id: Type.Integer(),
        }),
        body: Type.Object({
          content: Type.Optional(Type.String()),
        }),
      },
    },
    async (request) => {
      await f.documentRepository.update(request.params.id as DocumentId, request.body)
    }
  )

  f.delete(
    '/',
    {
      schema: {
        tags: ['document'],
        operationId: 'deleteDocument',
        params: Type.Object({
          id: Type.Integer(),
        }),
      },
    },
    async (request) => {
      await f.documentRepository.delete(request.params.id as DocumentId)
    }
  )

  f.get(
    '/random-pairs',
    {
      schema: {
        tags: ['document'],
        operationId: 'getRandomPairs',
        params: Type.Object({
          num: Type.Optional(Type.Integer({ maximum: 1000 })),
        }),
        response: {
          200: Type.Array(
            Type.Tuple([
              Type.Object({
                id: Type.Integer(),
                content: Type.String(),
              }),
              Type.Object({
                id: Type.Integer(),
                content: Type.String(),
              }),
            ])
          ),
        },
      },
    },
    async (request) => {
      return f.documentRepository.getRandomPairs(request.params.num)
    }
  )
}
