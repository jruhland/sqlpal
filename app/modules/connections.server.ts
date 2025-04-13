import { eq } from "drizzle-orm";
import type { z } from "zod";
import { connections } from "~/db/schema.server";
import { db } from "~/lib/db.server";
import { createConnectionSchema } from "./connections";

export async function createConnection(
  connection: z.infer<typeof createConnectionSchema>,
) {
  const parsedConnection = createConnectionSchema.parse(connection);
  const { config, name } = parsedConnection;

  const [conn] = await db
    .insert(connections)
    .values({
      name,
      driver: config.driver,
      config: JSON.stringify(config),
      idleTimeoutSeconds: 30,
    })
    .returning();

  return conn;
}

export async function listConnections() {
  const conns = await db.select().from(connections);
  return conns;
}

export async function getConnection(id: string) {
  const [conn] = await db
    .select()
    .from(connections)
    .where(eq(connections.id, id));

  return conn;
}
