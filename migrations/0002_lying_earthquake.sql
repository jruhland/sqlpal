CREATE TYPE "public"."drivers" AS ENUM('postgres', 'mysql');--> statement-breakpoint
ALTER TABLE "queries" DROP CONSTRAINT "queries_connection_id_connections_id_fk";
--> statement-breakpoint
ALTER TABLE "connections" ALTER COLUMN "driver" SET DATA TYPE drivers USING driver::drivers;--> statement-breakpoint
ALTER TABLE "queries" ADD CONSTRAINT "queries_connection_id_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."connections"("id") ON DELETE cascade ON UPDATE no action;