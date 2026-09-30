ALTER TABLE "admins" ADD COLUMN "pending_totp_secret" text;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "password_changed_at" timestamp with time zone;