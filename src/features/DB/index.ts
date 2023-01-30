import fastifyPlugin from 'fastify-plugin'
import DBService from './DBService'
import type { AppFastifyInstance } from '@/app/app'

declare module 'fastify' {
  interface FastifyInstance {
    DBService: ReturnType<typeof DBService>
  }
}

async function DBPlugin(f: AppFastifyInstance) {
  f.decorate('DBService', DBService(f))
}

export default async function registerDBPlugin(f: AppFastifyInstance) {
  return f.register(fastifyPlugin(DBPlugin))
}
