import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    
  `)
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export async function down(): Promise<void> {}
