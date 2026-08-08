CREATE TABLE "careers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"department" text NOT NULL,
	"location" text NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"requirements" jsonb,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "careers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jobId" uuid NOT NULL,
	"applicantName" text NOT NULL,
	"applicantEmail" text NOT NULL,
	"applicantPhone" text,
	"resumeUrl" text,
	"portfolioUrl" text,
	"coverLetter" text,
	"status" text DEFAULT 'pending',
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "job_applications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "whatsapp_contacts" (
	"phone" text PRIMARY KEY NOT NULL,
	"name" text,
	"status" text DEFAULT 'active',
	"last_interaction" timestamp DEFAULT CURRENT_TIMESTAMP,
	"metadata" jsonb,
	"has_opted_out" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "whatsapp_contacts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "whatsapp_message_retries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" text NOT NULL,
	"campaign_id" text,
	"recipient_phone" text NOT NULL,
	"content" text,
	"retry_count" integer DEFAULT 0,
	"max_retries" integer DEFAULT 3,
	"status" text DEFAULT 'pending',
	"next_retry_at" timestamp,
	"last_error" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "whatsapp_message_retries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "whatsapp_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text,
	"phone_number_id" text NOT NULL,
	"sender_wa_id" text NOT NULL,
	"message_type" text NOT NULL,
	"content" text,
	"status" text NOT NULL,
	"direction" text NOT NULL,
	"error_code" text,
	"error_message" text,
	"metadata" jsonb,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "abandoned_carts" ADD COLUMN "guestEmail" varchar(255);--> statement-breakpoint
ALTER TABLE "abandoned_carts" ADD COLUMN "guestPhone" varchar(50);--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."careers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_job_applications_job_id" ON "job_applications" USING btree ("jobId");--> statement-breakpoint
CREATE INDEX "idx_job_applications_status" ON "job_applications" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_whatsapp_contacts_status" ON "whatsapp_contacts" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_whatsapp_contacts_last_interaction" ON "whatsapp_contacts" USING btree ("last_interaction" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_whatsapp_retries_message" ON "whatsapp_message_retries" USING btree ("message_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_whatsapp_retries_status" ON "whatsapp_message_retries" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_whatsapp_messages_sender" ON "whatsapp_messages" USING btree ("sender_wa_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_whatsapp_messages_campaign" ON "whatsapp_messages" USING btree ("campaign_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_whatsapp_messages_created" ON "whatsapp_messages" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_products_name_search" ON "products" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_products_desc_search" ON "products" USING gin ("description" gin_trgm_ops);--> statement-breakpoint
CREATE POLICY "service_role_only" ON "abandoned_carts" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "service_role_only" ON "ai_chat_sessions" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "public_careers_readable" ON "careers" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "service_role_careers_all" ON "careers" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "service_role_job_applications_all" ON "job_applications" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "service_role_only" ON "whatsapp_contacts" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "service_role_only" ON "whatsapp_message_retries" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "service_role_only" ON "whatsapp_messages" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);