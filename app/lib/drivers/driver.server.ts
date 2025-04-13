import { recentQueries } from "~/db/schema.server";
import { db } from "../db.server";
import type { SchemaQueryResults } from "./utils";

export abstract class Driver {
  constructor(private connectionId: string) {}

  abstract getConnection(): Promise<unknown>;
  abstract getSchemaInformation(): Promise<SchemaQueryResults>;
  abstract executeQuery(statement: string): Promise<Record<string, unknown>[]>;
  abstract disconnect(): Promise<void>;

  async query(
    statement: string,
  ): Promise<{ rows: Record<string, unknown>[] } | { error: string }> {
    await db.insert(recentQueries).values({
      connectionId: this.connectionId,
      queryText: statement,
    });
    try {
      const res = await this.executeQuery(statement);
      return { rows: res };
    } catch (error) {
      if (error instanceof Error) {
        return {
          error: error.message,
        };
      }
      return { error: JSON.stringify(error) };
    }
  }
}
