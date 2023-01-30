import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    drop table if exists document
  `)

  await knex.raw(`
    drop table if exists score
  `)

  await knex.raw(`
    create table document(
        id integer primary key,
        content text not null
    ) strict;
  `)

  await knex.raw(`
    create table score(
        doc_1 integer references document,
        doc_2 integer references document check ( doc_2 != doc_1 ),
        value integer not null check ( value > 0 and value <= 10 ),
        primary key (doc_1, doc_2)
    ) strict;
  `)
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export async function down(): Promise<void> {}
