import { defineConfig } from "drizzle-kit";
import { config } from "~/lib/config.server";

export default defineConfig({
  dialect: "postgresql",
  schema: ["./app/db/auth-schema.server.ts", "./app/db/schema.server.ts"],
  out: "./migrations",
  dbCredentials: {
    url: config.DATABASE_URL,
  },
});
