import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("trackers", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.string("company_name").notNullable();
    table.string("label").nullable();
    table.text("url").notNullable();

    table
      .enu("status", ["ACTIVE", "PAUSED", "INVALID", "ERROR"])
      .notNullable()
      .defaultTo("ACTIVE");

    table.text("last_hash").nullable();
    table.timestamp("last_checked_at").nullable();
    table.timestamp("last_changed_at").nullable();

    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("trackers");
}