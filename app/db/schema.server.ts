import {
  customType,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { decrypt, encrypt } from "~/lib/encrypt.server";
import { connectionDrivers } from "~/modules/connections";
import { users } from "./auth-schema.server";

const encryptedText = (
  name: string,
  { type = "text" }: { type: "text" | "json" } = { type: "text" },
) =>
  customType<{ data: string | object }>({
    dataType() {
      return "text";
    },
    fromDriver(value: unknown) {
      const [ivBase64, encryptedData] = String(value).split(":");
      const decryptedData = decrypt({
        iv: Buffer.from(ivBase64, "hex"),
        data: encryptedData,
      });

      if (type === "json") {
        return JSON.parse(decryptedData);
      }

      return decryptedData;
    },
    toDriver(value: string | object) {
      let rawData = value;
      if (typeof value === "object") {
        if (type !== "json") {
          throw new Error("Invalid input type configured for encrypted text");
        }

        rawData = JSON.stringify(value);
      }

      const { iv, data } = encrypt(rawData as string);
      return `${iv.toString("hex")}:${data}`;
    },
  })(name);

export const drivers = pgEnum("drivers", connectionDrivers);

export const connections = pgTable(
  "connections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    driver: drivers("driver").notNull(),
    idleTimeoutSeconds: integer("idle_timeout_seconds"),
    config: encryptedText("config", { type: "json" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [uniqueIndex("uidx_connections_name").on(table.name)],
);

export const queries = pgTable("queries", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  connectionId: uuid("connection_id")
    .references(() => connections.id, { onDelete: "cascade" })
    .notNull(),
  queryText: encryptedText("query_text"),
  createdBy: text("created_by")
    .references(() => users.id)
    .notNull(),
  updatedBy: text("updated_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const recentQueries = pgTable("recent_queries", {
  id: uuid("id").primaryKey().defaultRandom(),
  connectionId: uuid("connection_id").references(() => connections.id, {
    onDelete: "cascade",
  }),
  queryText: text("query_text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
