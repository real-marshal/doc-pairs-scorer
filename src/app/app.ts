import type { FastifyError, FastifyInstance } from 'fastify'
import { X_REQUEST_ID } from '@/constants/headers'
import registerPlugins from './plugins'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import fastifySensible from '@fastify/sensible'
import type {
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from 'fastify/types/utils'
import type { FastifyBaseLogger } from 'fastify/types/logger'
import setValidator from './setValidator'
import fastifySwagger from '@fastify/swagger'
import packageJSON from '@/package.json'
import fastifySwaggerUI from '@fastify/swagger-ui'
import fastifyView from '@fastify/view'
import ejs from 'ejs'
import registerViews from '@/app/views'
import fastifyStatic from '@fastify/static'
import path from 'node:path'

export interface AppError extends FastifyError {
  reqId?: string
}

export type AppFastifyInstance = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger,
  TypeBoxTypeProvider
>

export default async function app(f: AppFastifyInstance) {
  f.log.info('Initializing the app')

  setValidator(f)

  await f.register(fastifySensible)

  await f.register(fastifyView, {
    engine: {
      ejs,
    },
    root: './src/views',
    layout: 'layout.ejs',
  })

  await f.register(fastifyStatic, {
    root: path.resolve('./src/assets'),
    prefix: '/assets',
  })

  if (process.env.NODE_ENV === 'development') {
    await f.register(fastifySwagger, {
      openapi: {
        info: {
          title: packageJSON.name,
          version: packageJSON.version,
        },
      },
    })

    await f.register(fastifySwaggerUI, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
      },
    })
  }

  await f.register(
    async (f) => {
      // Attach request id to the response so that clients would be able to send
      // it back to a support guy (to find the request in server logs)
      f.addHook('onRequest', async (request, reply) => {
        void reply.header(X_REQUEST_ID, request.id)
      })

      f.setErrorHandler<AppError>((error, request, reply) => {
        error.reqId = request.id as string

        // Prevent leaking data that could be used by adversaries
        if (!error.statusCode || error.statusCode >= 500) {
          f.log.error(error)
          return reply.internalServerError('Something bad happened.')
        }

        f.log.info(error)
        return error
      })

      void registerPlugins(f)
    },
    { prefix: 'api' }
  )

  await registerViews(f)

  await f.ready()

  f.log.info('Plugins are registered')
}
