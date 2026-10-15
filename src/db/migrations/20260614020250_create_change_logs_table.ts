import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("change_logs", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

    table
      .uuid("tracker_id")
      .notNullable()
      .references("id")
      .inTable("trackers")
      .onDelete("CASCADE");

    table.text("old_hash").nullable();
    table.text("new_hash").notNullable();

    table.timestamp("detected_at").notNullable().defaultTo(knex.fn.now());

    table.boolean("notification_sent").notNullable().defaultTo(false);

    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("change_logs");
}