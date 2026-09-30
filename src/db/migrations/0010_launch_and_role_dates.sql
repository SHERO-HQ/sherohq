ALTER TABLE "products" ADD COLUMN "launched_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "closed_at" timestamp with time zone;--> statement-breakpoint
UPDATE "products" SET "launched_at" = "updated_at" WHERE "status" = 'live' AND "launched_at" IS NULL;
