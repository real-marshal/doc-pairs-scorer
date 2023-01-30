import Knex from 'knex'

require('tsconfig-paths/register')

export default async function globalSetup() {
  process.env.DB_FILENAME = './test_db.sqlite3'

  const knex = Knex({
    client: 'better-sqlite3',
    connection: {
      filename: process.env.DB_FILENAME,
    },
    migrations: {
      directory: './src/migrations',
      tableName: 'migration',
      extension: 'ts',
    },
    useNullAsDefault: true,
  })

  await knex.migrate.up()

  await knex.destroy()
}
