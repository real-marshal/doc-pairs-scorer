import type { DocumentControllerFastifyInstance } from './index'
import { Type } from '@sinclair/typebox'
import type { DocumentId } from '@/schemas'
import { SortDirection } from '@/types/common'

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

  f.get(
    '/',
    {
      schema: {
        tags: ['document'],
        operationId: 'getDocuments',
        querystring: Type.Object({
          page: Type.Optional(Type.Integer()),
          count: Type.Optional(Type.Integer()),
          sortDirection: Type.Optional(Type.Enum(SortDirection)),
        }),
        response: {
          200: Type.Array(
            Type.Object({
              id: Type.Integer(),
              content: Type.String(),
            })
          ),
        },
      },
    },
    async (request) => {
      return f.documentRepository.getDocuments(request.query)
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
        response: {
          200: Type.Object({
            id: Type.Integer(),
            content: Type.String(),
          }),
        },
      },
    },
    async (request) => {
      const id = await f.documentRepository.create(request.body)
      return f.documentRepository.get(id)
    }
  )

  f.put(
    '/:id',
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
    '/:id',
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
        querystring: Type.Object({
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
      return f.documentRepository.getRandomPairs(request.query.num)
    }
  )

  f.get(
    '/count',
    {
      schema: {
        tags: ['document'],
        operationId: 'countPages',
        response: {
          200: Type.Integer(),
        },
      },
    },
    async () => {
      return f.documentRepository.countPages()
    }
  )
}
