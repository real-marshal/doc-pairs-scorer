import { rimraf } from 'rimraf'

export default async function globalTeardown() {
  await rimraf(process.env.DB_FILENAME)
}
