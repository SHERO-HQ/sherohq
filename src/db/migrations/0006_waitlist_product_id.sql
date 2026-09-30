DROP INDEX "waitlist_product_phone_unique";--> statement-breakpoint
ALTER TABLE "waitlist_signups" ALTER COLUMN "product_id" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_product_phone_unique" ON "waitlist_signups" USING btree ("product_id","phone");--> statement-breakpoint
ALTER TABLE "waitlist_signups" DROP COLUMN "product";--> statement-breakpoint
DROP TYPE "public"."waitlist_product";