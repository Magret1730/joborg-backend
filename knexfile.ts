import type { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config();

const getDbConnection = () => {
  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5433),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  };
};

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: getDbConnection(),
    migrations: {
      directory: "./src/db/migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./src/db/seeds",
      extension: "ts",
    },
  },

  production: {
    client: "pg",
    connection: getDbConnection(),
    migrations: {
      directory: "./dist/db/migrations",
      extension: "js",
    },
    seeds: {
      directory: "./dist/db/seeds",
      extension: "js",
    },
  },
};

export default config;

// import type { Knex } from "knex";
// import dotenv from "dotenv";

// dotenv.config();

// const config: { [key: string]: Knex.Config } = {
//   development: {
//     client: "pg",
//     connection: process.env.DATABASE_URL,
//     migrations: {
//       directory: "./src/db/migrations",
//       extension: "ts",
//     },
//     seeds: {
//       directory: "./src/db/seeds",
//       extension: "ts",
//     },
//   },
// };

// export default config;