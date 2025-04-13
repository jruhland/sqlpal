import slugify from "slugify";
import { z } from "zod";

export const connectionDrivers = [
  "postgres",
  "mysql",
  "sqlite",
  "cassandra",
  "bigquery",
  "clickhouse",
] as const;

const sqlSchema = z.object({
  host: z.string(),
  port: z.number(),
  database: z.string(),
  username: z.string(),
  password: z.string(),
});

export const postgresConnectionSchema = sqlSchema.extend({
  driver: z.literal("postgres"),
  ssl: z.boolean().optional().default(false),
});

export const mysqlConnectionSchema = sqlSchema.extend({
  driver: z.literal("mysql"),
});

export const sqliteConnectionSchema = z.object({
  driver: z.literal("sqlite"),
  filename: z.string(),
  readonly: z.boolean().optional().default(false),
});

export const cassandraConnectionSchema = z.object({
  driver: z.literal("cassandra").describe("must be cassandra"),
  contactPoints: z.string().describe("Contact points (comma delimited)"),
  localDataCenter: z.string().describe("Local data center"),
  keyspace: z.string().describe("Keyspace"),
});

export const bigqueryConnectionSchema = z.object({
  driver: z.literal("bigquery"),
  keyfile: z.string().describe("Path to the service account keyfile"),
  projectId: z.string().describe("Google Cloud Project ID"),
  datasetName: z.string().describe("BigQuery dataset name"),
  datasetLocation: z.string().describe("BigQuery dataset location"),
});

export const clickhouseConnectionSchema = sqlSchema.extend({
  driver: z.literal("clickhouse"),
});

export const connectionSchemas = z.discriminatedUnion("driver", [
  postgresConnectionSchema,
  mysqlConnectionSchema,
  sqliteConnectionSchema,
  cassandraConnectionSchema,
  bigqueryConnectionSchema,
  clickhouseConnectionSchema,
]);

export const createConnectionSchema = z.object({
  name: z.string().transform((val) => slugify(val)),
  config: connectionSchemas,
});

export const updateConnectionSchema = createConnectionSchema.extend({
  id: z.string(),
  config: connectionSchemas,
});
