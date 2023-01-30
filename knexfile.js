require('dotenv-defaults').config()

module.exports = {
  client: 'better-sqlite3',
  connection: {
    filename: process.env.DB_FILENAME,
  },
  migrations: {
    directory: './src/migrations',
    tableName: 'migration',
    extension: 'ts',
    stub: './src/utils/migration-stub.ts',
  },
  useNullAsDefault: true,
}
