import { CassandraIcon } from "~/components/icons/cassandra";
import { MySQLIcon } from "~/components/icons/mysql";
import { PostgresIcon } from "~/components/icons/postgres";
import { SQLiteIcon } from "~/components/icons/sqlite";
import type { drivers } from "~/db/schema.server";
import { cn } from "~/lib/utils";
import { BigQueryIcon } from "./icons/bigquery";
import { ClickhouseIcon } from "./icons/clickhouse";

export function ConnectionIcon({
  className,
  driver,
}: {
  className?: string;
  driver: (typeof drivers.enumValues)[number];
}) {
  switch (driver) {
    case "postgres":
      return <PostgresIcon className={cn(className)} />;
    case "mysql":
      return <MySQLIcon className={cn(className)} />;
    case "sqlite":
      return <SQLiteIcon className={cn(className)} />;
    case "cassandra":
      return <CassandraIcon className={cn(className)} />;
    case "bigquery":
      return <BigQueryIcon className={cn(className)} />;
    case "clickhouse":
      return <ClickhouseIcon className={cn(className)} />;
    default:
      throw new Error(`Unknown driver: ${driver}`);
  }
}
