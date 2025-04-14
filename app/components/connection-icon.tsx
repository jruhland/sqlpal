import { File } from "lucide-react";
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
  let Icon: React.ElementType | null = null;
  switch (driver) {
    case "postgres":
      Icon = PostgresIcon;
      break;
    case "mysql":
      Icon = MySQLIcon;
      break;
    case "sqlite":
      Icon = SQLiteIcon;
      break;
    case "cassandra":
      Icon = CassandraIcon;
      break;
    case "bigquery":
      Icon = BigQueryIcon;
      break;
    case "clickhouse":
      Icon = ClickhouseIcon;
      break;
    default:
      Icon = File;
  }

  return <Icon className={cn("dark:fill-white", className)} />;
}
