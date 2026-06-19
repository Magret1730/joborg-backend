import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("trackers", (table) => {
    table.text("scraper_type").notNullable().defaultTo("AUTO");
  });

  await knex.raw(`
    ALTER TABLE trackers
    ADD CONSTRAINT trackers_scraper_type_check
    CHECK (scraper_type IN ('AUTO', 'STATIC', 'BROWSER'));
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE trackers
    DROP CONSTRAINT IF EXISTS trackers_scraper_type_check;
  `);

  await knex.schema.alterTable("trackers", (table) => {
    table.dropColumn("scraper_type");
  });
}