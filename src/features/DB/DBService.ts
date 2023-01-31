// noinspection SqlResolve

import Knex from 'knex'
import type { AppFastifyInstance } from '@/app/app'
import { camelizeObject } from '@/utils/object'
import { snakeCase } from 'lodash'

export default function DBService(f: AppFastifyInstance) {
  const knex = Knex({
    client: 'better-sqlite3',
    connection: {
      filename: process.env.DB_FILENAME,
    },
    useNullAsDefault: true,
    postProcessResponse: (result: unknown) => {
      if (!result || typeof result !== 'object') return result

      return Array.isArray(result)
        ? result.map((row) => camelizeObject(row as Record<string, unknown>))
        : camelizeObject(result as Record<string, unknown>)
    },
    wrapIdentifier: (value, origImpl) => origImpl(snakeCase(value)),
  })

  f.addHook('onClose', async () => {
    f.log.info('Closing DB connections')
    await knex.destroy()
  })

  function createCRUD<
    Model extends object,
    ModelId extends number,
    ModelInitializer extends object,
    ModelMutator extends object
  >(table: string) {
    async function create(values: ModelInitializer): Promise<ModelId> {
      const results = (await knex(table).insert(values, ['id'])) as Array<{ id: ModelId }>
      return results[0]?.id as ModelId
    }

    async function get(id: ModelId): Promise<Model | undefined> {
      const results = await knex(table).select().where({ id })
      return results[0] as Model
    }

    async function update(id: ModelId, values: ModelMutator): Promise<void> {
      await knex(table).update(values).where({ id })
    }

    async function _delete(id: ModelId): Promise<void> {
      await knex(table).delete().where({ id })
    }

    return {
      create,
      get,
      update,
      delete: _delete,
    }
  }

  return {
    knex,
    createCRUD,
  }
}
