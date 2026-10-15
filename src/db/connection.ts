import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is not defined`);
  }
}

const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  },
  pool: {
    min: 0,
    max: 10,
  },
});

export default db;

// import knex from "knex";
// import dotenv from "dotenv";

// dotenv.config();

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL is not defined");
// }

// const db = knex({
//   client: "pg",
//   connection: process.env.DATABASE_URL,
// });

// export default db;