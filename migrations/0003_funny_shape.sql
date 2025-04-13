CREATE UNIQUE INDEX "uidx_connections_name" ON "connections" USING btree ("name");--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_name_unique" UNIQUE("name");