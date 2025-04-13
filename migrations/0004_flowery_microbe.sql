ALTER TABLE "connections" RENAME COLUMN "data" TO "config";--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN "description";