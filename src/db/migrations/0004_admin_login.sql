ALTER TABLE "admins" ADD COLUMN "totp_last_step" integer;--> statement-breakpoint
CREATE INDEX "login_events_created_idx" ON "login_events" USING btree ("created_at");