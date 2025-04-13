import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as authSchema from "~/db/auth-schema.server";
import * as schema from "~/db/schema.server";
import { config } from "./config.server";

const pool = new pg.Pool({
  connectionString: config.DATABASE_URL,
});

export const db = drizzle({
  client: pool,
  schema: {
    ...authSchema,
    ...schema,
  },
});
