ALTER TABLE "settings" ADD COLUMN "notify_email" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "notify_orders" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "notify_consultations" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "notify_waitlists" boolean DEFAULT true NOT NULL;