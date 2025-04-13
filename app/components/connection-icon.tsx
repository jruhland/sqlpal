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
      return <PostgresIcon className={cn("dark:fill-white", className)} />;
    case "mysql":
      return <MySQLIcon className={cn("dark:fill-white", className)} />;
    case "sqlite":
      return <SQLiteIcon className={cn("dark:fill-white", className)} />;
    case "cassandra":
      return <CassandraIcon className={cn("dark:fill-white", className)} />;
    case "bigquery":
      return <BigQueryIcon className={cn("dark:fill-white", className)} />;
    case "clickhouse":
      return <ClickhouseIcon className={cn("dark:fill-white", className)} />;
    default:
      throw new Error(`Unknown driver: ${driver}`);
  }
}
