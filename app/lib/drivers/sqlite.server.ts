import sqlite3 from "better-sqlite3";
import sqlLimiter from "sql-limiter";
import type { z } from "zod";
import type { sqliteConnectionSchema } from "~/modules/connections";
import { Driver } from "./driver.server";
import { type Row, formatSchemaQueryResults } from "./utils";

const SCHEMA_SQL = `
  SELECT
    'main' as table_schema,
    name as table_name,
    null as column_name,
    null as data_type
  FROM
    sqlite_master
`;

export class SQLiteDriver extends Driver {
  private db: sqlite3.Database;

  constructor(
    connectionId: string,
    config: z.infer<typeof sqliteConnectionSchema>,
  ) {
    super(connectionId);
    const { filename, readonly } = config;
    this.isConnected = true;
    this.db = new sqlite3(filename);
  }

  async getConnection() {
    return this.db;
  }

  async getSchemaInformation() {
    const schemaResult = this.doQuery(SCHEMA_SQL) as Row[];
    const columnRows: Row[] = [];
    for (const tableRow of schemaResult) {
      const { table_name } = tableRow;
      const columnQueryResult = this.doQuery(
        `PRAGMA table_info(${table_name})`,
      ) as { name: string; type: string }[];

      for (const row of columnQueryResult) {
        columnRows.push({
          table_schema: "main",
          table_name,
          column_name: row.name,
          data_type: row.type,
        });
      }
    }

    return formatSchemaQueryResults(columnRows);
  }

  async executeQuery(statement: string) {
    const enforcedQuery = sqlLimiter.limit(statement, ["limit", "fetch"], 1000);
    const results = this.doQuery(enforcedQuery);
    if (results.length === 0) {
      return [];
    }

    return results as Record<string, unknown>[];
  }

  private doQuery(statement: string) {
    const stmt = this.db.prepare(statement);
    return stmt.all();
  }

  async disconnect() {
    await this.pool.end();
    this.isConnected = false;
  }
}
