CREATE TYPE "public"."consultation_status" AS ENUM('new', 'contacted', 'call_held', 'quoted', 'won', 'closed');--> statement-breakpoint
CREATE TYPE "public"."contact_method" AS ENUM('call', 'email', 'whatsapp');--> statement-breakpoint
CREATE TYPE "public"."delivery_method" AS ENUM('tamale', 'bus', 'pickup');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('draft', 'in_stock', 'reserved', 'sold');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('placed', 'confirmed', 'in_transit', 'arrived', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('momo', 'card', 'cash_on_delivery', 'pay_at_pickup');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed');--> statement-breakpoint
CREATE TYPE "public"."referral_status" AS ENUM('waiting_for_delivery', 'ready_to_thank', 'thanked', 'asked_to_stay', 'kept', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."testimonial_source" AS ENUM('project', 'order');--> statement-breakpoint
CREATE TYPE "public"."waitlist_product" AS ENUM('merchander', 'pharmasyst');--> statement-breakpoint
CREATE TYPE "public"."waitlist_status" AS ENUM('new', 'contacted', 'invited', 'piloting');--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"totp_secret" text,
	"totp_enabled_at" timestamp with time zone,
	"recovery_codes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "consultations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"business" text,
	"need" text NOT NULL,
	"message" text,
	"contact_method" "contact_method" NOT NULL,
	"status" "consultation_status" DEFAULT 'new' NOT NULL,
	"notes" text,
	"last_contact_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device_checks" (
	"listing_id" uuid PRIMARY KEY NOT NULL,
	"screen" boolean,
	"keyboard" boolean,
	"trackpad" boolean,
	"ports" boolean,
	"speakers" boolean,
	"camera" boolean,
	"wifi" boolean,
	"charging" boolean,
	"battery_health" smallint,
	"battery_replaced" boolean,
	"battery_type" text,
	"cosmetic_condition" smallint,
	"cleaned_and_reset" boolean,
	"serial_last4" text,
	"checked_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "device_checks_battery_range" CHECK ("device_checks"."battery_health" between 0 and 100),
	CONSTRAINT "device_checks_cosmetic_range" CHECK ("device_checks"."cosmetic_condition" between 0 and 100),
	CONSTRAINT "device_checks_serial_last4" CHECK ("device_checks"."serial_last4" ~ '^[A-Za-z0-9]{4}$')
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"model" text NOT NULL,
	"category" text NOT NULL,
	"specs" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"price_pesewas" integer NOT NULL,
	"note" text,
	"grade" text DEFAULT 'A++' NOT NULL,
	"status" "listing_status" DEFAULT 'draft' NOT NULL,
	"photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sold_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "listings_slug_unique" UNIQUE("slug"),
	CONSTRAINT "listings_price_positive" CHECK ("listings"."price_pesewas" > 0)
);
--> statement-breakpoint
CREATE TABLE "login_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid,
	"outcome" text NOT NULL,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"status" "order_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"listing_id" uuid,
	"model" text NOT NULL,
	"spec_summary" text,
	"price_pesewas" integer NOT NULL,
	"quantity" smallint DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" text NOT NULL,
	"customer_name" text,
	"phone" text,
	"email" text,
	"delivery_method" "delivery_method" NOT NULL,
	"region" text,
	"town" text,
	"pickup_station" text,
	"address" text,
	"payment_method" "payment_method" NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"payment_reference" text,
	"status" "order_status" DEFAULT 'placed' NOT NULL,
	"subtotal_pesewas" integer NOT NULL,
	"delivery_fee_pesewas" integer DEFAULT 0 NOT NULL,
	"total_pesewas" integer NOT NULL,
	"had_referral" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmed_at" timestamp with time zone,
	"in_transit_at" timestamp with time zone,
	"arrived_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"warranty_ends_on" date,
	"anonymised_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_number_unique" UNIQUE("number"),
	CONSTRAINT "orders_payment_reference_unique" UNIQUE("payment_reference"),
	CONSTRAINT "orders_total_matches" CHECK ("orders"."total_pesewas" = "orders"."subtotal_pesewas" + "orders"."delivery_fee_pesewas"),
	CONSTRAINT "orders_number_format" CHECK ("orders"."number" ~ '^SH-[A-Z0-9]{5}$')
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"client" text,
	"logo_url" text,
	"summary" text,
	"built" text,
	"year" text,
	"outcome" text,
	"problem" text,
	"solution" text,
	"result" text,
	"screenshots" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"url" text,
	"published" boolean DEFAULT false NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"referrer_phone" text,
	"status" "referral_status" DEFAULT 'waiting_for_delivery' NOT NULL,
	"token_type" text,
	"token_amount_pesewas" integer,
	"thanked_at" timestamp with time zone,
	"asked_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "referrals_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"how_to_apply" text NOT NULL,
	"open" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"display_name" text DEFAULT 'SHERO' NOT NULL,
	"contact_email" text DEFAULT 'hello@sherohq.com' NOT NULL,
	"phone" text DEFAULT '+233548711582' NOT NULL,
	"whatsapp_number" text DEFAULT '233548711582' NOT NULL,
	"address" text DEFAULT 'Tamale, Ghana' NOT NULL,
	"opening_hours" text DEFAULT 'Mon–Fri, 8:00 AM – 6:00 PM' NOT NULL,
	"free_delivery_threshold_pesewas" integer DEFAULT 200000 NOT NULL,
	"delivery_wording" text DEFAULT 'Free nationwide delivery on orders over GHS 2,000. Orders placed before 5:00 PM go to the bus station the same day.' NOT NULL,
	"payment_methods" jsonb DEFAULT '["momo","card","cash_on_delivery","pay_at_pickup"]'::jsonb NOT NULL,
	"categories" jsonb DEFAULT '["Laptops","Phones","Desktops","Audio","Accessories"]'::jsonb NOT NULL,
	"min_battery_health" smallint DEFAULT 90 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "settings_single_row" CHECK ("settings"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote" text NOT NULL,
	"attribution" text NOT NULL,
	"business" text,
	"source" "testimonial_source" NOT NULL,
	"project_id" uuid,
	"order_id" uuid,
	"consent_given_at" timestamp with time zone,
	"consent_method" text,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "testimonials_consent_before_publish" CHECK (not "testimonials"."published" or "testimonials"."consent_given_at" is not null)
);
--> statement-breakpoint
CREATE TABLE "waitlist_signups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product" "waitlist_product" NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"business" text NOT NULL,
	"detail" text NOT NULL,
	"status" "waitlist_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_checks" ADD CONSTRAINT "device_checks_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_events" ADD CONSTRAINT "login_events_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_sessions_expires_idx" ON "admin_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "consultations_status_idx" ON "consultations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "listings_status_idx" ON "listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_events_order_idx" ON "order_events" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "orders_phone_idx" ON "orders" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_product_phone_unique" ON "waitlist_signups" USING btree ("product","phone");