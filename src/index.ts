import 'dotenv-defaults/config'
import Fastify from 'fastify'
import app from '@/app/app'
import config from '@/app/config'

const f = Fastify(config)

const start = async () => {
  try {
    await app(f)
    await f.listen({ port: process.env.PORT, host: process.env.HOST })
  } catch (err) {
    f.log.error(err)
    f.log.info('Shutting down')
    await f.close()
    process.exit(1)
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
start()
