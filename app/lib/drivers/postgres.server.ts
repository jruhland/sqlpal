import { sql } from "@codemirror/lang-sql";
import pg from "pg";
import sqlLimiter from "sql-limiter";
import type { z } from "zod";
import type { postgresConnectionSchema } from "~/modules/connections";
import { Driver } from "./driver.server";
import { formatSchemaQueryResults } from "./utils";

const SCHEMA_SQL = `
  select
    ns.nspname as table_schema,
    cls.relname as table_name,
    attr.attname as column_name,
    trim(leading '_' from tp.typname) as data_type,
    pg_catalog.col_description(attr.attrelid, attr.attnum) as column_description
  from
    pg_catalog.pg_attribute as attr
    join pg_catalog.pg_class as cls on cls.oid = attr.attrelid
    join pg_catalog.pg_namespace as ns on ns.oid = cls.relnamespace
    join pg_catalog.pg_type as tp on tp.typelem = attr.atttypid
  where
    cls.relkind in ('r', 'v', 'm', 'f')
    and ns.nspname not in ('pg_catalog', 'pg_toast', 'information_schema')
    and not attr.attisdropped
    and attr.attnum > 0
  order by
    ns.nspname,
    cls.relname,
    attr.attnum
`;

export class PostgresDriver extends Driver {
  private pool: pg.Pool;

  constructor(
    connectionId: string,
    config: z.infer<typeof postgresConnectionSchema>,
  ) {
    super(connectionId);
    this.pool = new pg.Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });
  }

  async getConnection() {
    if (!this.isConnected) {
      await this.pool.connect();
      this.isConnected = true;
    }

    return this.pool;
  }

  async getSchemaInformation() {
    const client = await this.getConnection();
    const res = await client.query(SCHEMA_SQL);
    return formatSchemaQueryResults(res.rows);
  }

  async executeQuery(statement: string) {
    const client = await this.getConnection();
    const enforcedQuery = sqlLimiter.limit(statement, ["limit", "fetch"], 1000);
    const res = await client.query(enforcedQuery);
    return res.rows;
  }

  async disconnect() {
    await this.pool.end();
    this.isConnected = false;
  }
}
