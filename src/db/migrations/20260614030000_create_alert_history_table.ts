import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("alert_history", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table
      .uuid("tracker_id")
      .notNullable()
      .references("id")
      .inTable("trackers")
      .onDelete("CASCADE");

    table
      .uuid("change_log_id")
      .nullable()
      .references("id")
      .inTable("change_logs")
      .onDelete("SET NULL");

    table.string("channel").notNullable().defaultTo("email");

    table.string("recipient").notNullable();

    table
      .enu("status", ["PENDING", "SENT", "FAILED"])
      .notNullable()
      .defaultTo("PENDING");

    table.text("message").notNullable();

    table.timestamp("sent_at").nullable();

    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("alert_history");
}