-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"adminId" text NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "sessions_token_key" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "abandoned_carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text,
	"guestId" varchar(255),
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"lastActive" timestamp with time zone DEFAULT now(),
	"emailSent" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "abandoned_carts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "support_guides" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text NOT NULL,
	"summary" text,
	"category" text NOT NULL,
	"authorId" text,
	"coverImage" text,
	"published" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "support_guides_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "support_guides" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"bio" text,
	"image" text,
	"social" jsonb,
	"order" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "team_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"userName" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"client" text,
	"description" text,
	"useCase" text,
	"technologies" jsonb,
	"image" text,
	"link" text,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "consultations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"service" text NOT NULL,
	"date" timestamp NOT NULL,
	"time" text NOT NULL,
	"message" text,
	"status" text DEFAULT 'pending',
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "consultations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "newsletter_campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"subject" text NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'draft',
	"audienceStatus" text DEFAULT 'active',
	"audienceSource" text,
	"audienceSubscribedAfter" timestamp,
	"audienceSubscribedBefore" timestamp,
	"recipientLimit" integer,
	"batchSize" integer DEFAULT 100,
	"sendDelayMs" integer DEFAULT 0,
	"isTest" boolean DEFAULT false,
	"testEmail" text,
	"totalTargets" integer DEFAULT 0,
	"sentCount" integer DEFAULT 0,
	"failedCount" integer DEFAULT 0,
	"scheduledAt" timestamp,
	"sentAt" timestamp,
	"createdBy" text,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
	"channel" text DEFAULT 'email',
	"testPhone" text,
	"whatsappTemplateName" text,
	"whatsappTemplateLanguage" text,
	"whatsappTemplateParams" jsonb
);
--> statement-breakpoint
ALTER TABLE "newsletter_campaigns" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"adminId" text,
	"action" text NOT NULL,
	"details" text,
	"type" text DEFAULT 'info',
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"passwordHash" text NOT NULL,
	"role" text DEFAULT 'admin',
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
	"avatar" text,
	"phone" text,
	"passwordResetRequired" boolean DEFAULT true,
	"passwordUpdatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
	"isActive" boolean DEFAULT true,
	"mfaEnabled" boolean DEFAULT false,
	"mfaSecret" text,
	CONSTRAINT "admin_users_username_key" UNIQUE("username"),
	CONSTRAINT "admin_users_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "admin_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "customer_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"rating" integer,
	"message" text NOT NULL,
	"page" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "customer_feedback" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" text PRIMARY KEY NOT NULL,
	"quote" text NOT NULL,
	"author" text NOT NULL,
	"role" text,
	"company" text,
	"image" text,
	"order" integer DEFAULT 0,
	"active" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
	"externalSource" text,
	"externalId" text,
	"rating" integer,
	"reviewUrl" text,
	"publishedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "testimonials" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "catalog_gaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"keyword" text NOT NULL,
	"queryCount" integer DEFAULT 1,
	"lastRequested" timestamp DEFAULT CURRENT_TIMESTAMP,
	"isResolved" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "catalog_gaps" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"guestId" text NOT NULL,
	"userId" text,
	"items" jsonb NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"shippingInfo" jsonb NOT NULL,
	"paymentMethod" text,
	"status" text DEFAULT 'pending',
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
	"referralCode" text,
	"orderAccessTokenHash" text,
	"cogs" numeric(10, 2) DEFAULT '0.00',
	"paymentStatus" text DEFAULT 'pending' NOT NULL,
	"paymentMessage" text,
	"clientReference" text,
	CONSTRAINT "orders_paymentStatus_check" CHECK ("paymentStatus" = ANY (ARRAY['confirmed'::text, 'failed'::text, 'pending'::text]))
);
--> statement-breakpoint
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"originalPrice" numeric(10, 2),
	"image" text,
	"images" jsonb,
	"rating" numeric(3, 2) DEFAULT '0',
	"reviews" integer DEFAULT 0,
	"badge" text,
	"inStock" boolean DEFAULT true,
	"stockQuantity" integer DEFAULT 100,
	"description" text,
	"features" jsonb,
	"specifications" jsonb,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
	"sku" text,
	"condition" text DEFAULT 'New',
	"slug" text,
	"isSpotlight" boolean DEFAULT false,
	"isFeatured" boolean DEFAULT false,
	"costPrice" numeric(10, 2) DEFAULT '0.00',
	"metaTitle" varchar(60),
	"metaDescription" varchar(160),
	CONSTRAINT "products_sku_key" UNIQUE("sku"),
	CONSTRAINT "products_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon" text
);
--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ai_chat_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guestId" text,
	"userId" text,
	"query" text NOT NULL,
	"response" text NOT NULL,
	"intent" text,
	"recommendedProducts" jsonb,
	"hasImage" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
	"source" text DEFAULT 'general'
);
--> statement-breakpoint
ALTER TABLE "ai_chat_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "site_stats" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"suffix" text,
	"prefix" text,
	"icon" text,
	"color" text,
	"order" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "site_stats" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "user_sessions_token_key" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "user_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"passwordHash" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"emailVerified" boolean DEFAULT false,
	"verificationToken" text,
	"verificationExpiry" text,
	"shippingAddress" jsonb,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
	"avatar" text,
	"isActive" boolean DEFAULT true,
	"role" text DEFAULT 'customer',
	"passwordResetRequired" boolean DEFAULT false,
	"passwordUpdatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
	"resetToken" text,
	"resetTokenExpiry" timestamp,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'pending',
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "inquiries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"category" text NOT NULL,
	"date" timestamp NOT NULL,
	"description" text,
	"adminId" text,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"source" text DEFAULT 'footer',
	"status" text DEFAULT 'active',
	"unsubscribeToken" text NOT NULL,
	"subscribedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
	"unsubscribedAt" timestamp,
	"lastCampaignAt" timestamp,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
	"phone" text,
	CONSTRAINT "newsletter_subscribers_email_key" UNIQUE("email"),
	CONSTRAINT "newsletter_subscribers_unsubscribeToken_key" UNIQUE("unsubscribeToken")
);
--> statement-breakpoint
ALTER TABLE "newsletter_subscribers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"category" text NOT NULL,
	"priority" text DEFAULT 'medium',
	"status" text DEFAULT 'open',
	"productId" text,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
	"phone" text,
	"ticket_no" serial NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tickets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ai_chat_sessions" (
	"session_id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"summary" text,
	"last_updated" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "ai_chat_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "abandoned_carts" ADD CONSTRAINT "abandoned_carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_guides" ADD CONSTRAINT "support_guides_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_campaigns" ADD CONSTRAINT "newsletter_campaigns_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_sessions" ADD CONSTRAINT "ai_chat_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_sessions_adminid" ON "sessions" USING btree ("adminId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_sessions_expires" ON "sessions" USING btree ("expiresAt" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_sessions_token" ON "sessions" USING btree ("token" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_abandoned_carts_guest_id" ON "abandoned_carts" USING btree ("guestId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_abandoned_carts_user_id" ON "abandoned_carts" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_support_guides_authorid" ON "support_guides" USING btree ("authorId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_support_guides_category" ON "support_guides" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "idx_support_guides_created_at" ON "support_guides" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_support_guides_published" ON "support_guides" USING btree ("published" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_reviews_created" ON "reviews" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_reviews_product" ON "reviews" USING btree ("productId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_consultations_status" ON "consultations" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_newsletter_campaigns_channel" ON "newsletter_campaigns" USING btree ("channel" text_ops);--> statement-breakpoint
CREATE INDEX "idx_newsletter_campaigns_created" ON "newsletter_campaigns" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_newsletter_campaigns_createdby" ON "newsletter_campaigns" USING btree ("createdBy" text_ops);--> statement-breakpoint
CREATE INDEX "idx_newsletter_campaigns_scheduled" ON "newsletter_campaigns" USING btree ("scheduledAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_newsletter_campaigns_status" ON "newsletter_campaigns" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_activity_logs_admin" ON "activity_logs" USING btree ("adminId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_activity_logs_created" ON "activity_logs" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_admin_users_id" ON "admin_users" USING btree ("id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_testimonials_external_unique" ON "testimonials" USING btree ("externalSource" text_ops,"externalId" text_ops) WHERE (("externalSource" IS NOT NULL) AND ("externalId" IS NOT NULL));--> statement-breakpoint
CREATE INDEX "idx_testimonials_order_created" ON "testimonials" USING btree ("order" int4_ops,"createdAt" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_catalog_gaps_count" ON "catalog_gaps" USING btree ("queryCount" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_access_token_hash" ON "orders" USING btree ("orderAccessTokenHash" text_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_client_reference" ON "orders" USING btree ("clientReference" text_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_composite" ON "orders" USING btree ("status" text_ops,"createdAt" text_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_created_at" ON "orders" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_guest_id" ON "orders" USING btree ("guestId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "orders" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_user_id" ON "orders" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_products_category" ON "products" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "idx_products_created_at" ON "products" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_products_in_stock" ON "products" USING btree ("inStock" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_products_name" ON "products" USING btree ("name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_products_sku" ON "products" USING btree ("sku" text_ops) WHERE (sku IS NOT NULL);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_products_slug" ON "products" USING btree ("slug" text_ops) WHERE (slug IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_products_stock" ON "products" USING btree ("stockQuantity" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_categories_name" ON "categories" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_chat_logs_created_at" ON "ai_chat_logs" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_user_sessions_token" ON "user_sessions" USING btree ("token" text_ops);--> statement-breakpoint
CREATE INDEX "idx_user_sessions_userid" ON "user_sessions" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_inquiries_status" ON "inquiries" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_expenses_adminid" ON "expenses" USING btree ("adminId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_expenses_category" ON "expenses" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "idx_expenses_date" ON "expenses" USING btree ("date" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_newsletter_subscribers_email" ON "newsletter_subscribers" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_newsletter_subscribers_phone" ON "newsletter_subscribers" USING btree ("phone" text_ops);--> statement-breakpoint
CREATE INDEX "idx_newsletter_subscribers_status" ON "newsletter_subscribers" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_newsletter_subscribers_token" ON "newsletter_subscribers" USING btree ("unsubscribeToken" text_ops);--> statement-breakpoint
CREATE INDEX "idx_tickets_category" ON "tickets" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "idx_tickets_productid" ON "tickets" USING btree ("productId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_tickets_status" ON "tickets" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_tickets_user_id" ON "tickets" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_ai_chat_sessions_user_id" ON "ai_chat_sessions" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE POLICY "service_role_only" ON "sessions" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "public_support_guides_readable" ON "support_guides" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "service_role_only" ON "team_members" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "public_reviews_readable" ON "reviews" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "public_projects_readable" ON "projects" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "public_consultations_insert" ON "consultations" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((email IS NOT NULL));--> statement-breakpoint
CREATE POLICY "public_consultations_select" ON "consultations" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "public_consultations_update" ON "consultations" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "public_newsletter_campaigns_readable" ON "newsletter_campaigns" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "public_activity_logs_service" ON "activity_logs" AS PERMISSIVE FOR ALL TO public USING ((( SELECT auth.role() AS role) = 'service_role'::text));--> statement-breakpoint
CREATE POLICY "service_role_only" ON "admin_users" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "service_role_only" ON "customer_feedback" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "public_testimonials_readable" ON "testimonials" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "public_catalog_gaps_readable" ON "catalog_gaps" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "service_role_only" ON "orders" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "public_products_readable" ON "products" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "admin_products_insert" ON "products" AS PERMISSIVE FOR INSERT TO "authenticated", "service_role";--> statement-breakpoint
CREATE POLICY "admin_products_update" ON "products" AS PERMISSIVE FOR UPDATE TO "authenticated", "service_role";--> statement-breakpoint
CREATE POLICY "admin_products_delete" ON "products" AS PERMISSIVE FOR DELETE TO "authenticated", "service_role";--> statement-breakpoint
CREATE POLICY "public_categories_readable" ON "categories" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "public_ai_chat_logs_insert" ON "ai_chat_logs" AS PERMISSIVE FOR INSERT TO public WITH CHECK (((( SELECT auth.role() AS role) = 'authenticated'::text) OR (( SELECT auth.role() AS role) = 'service_role'::text) OR (( SELECT auth.role() AS role) = 'anon'::text)));--> statement-breakpoint
CREATE POLICY "public_ai_chat_logs_select" ON "ai_chat_logs" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "public_site_stats_readable" ON "site_stats" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "service_role_only" ON "user_sessions" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "service_role_only" ON "users" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "public_inquiries_insert" ON "inquiries" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((email IS NOT NULL));--> statement-breakpoint
CREATE POLICY "public_inquiries_select" ON "inquiries" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "public_expenses_readable" ON "expenses" AS PERMISSIVE FOR SELECT TO public USING ((( SELECT auth.role() AS role) = 'service_role'::text));--> statement-breakpoint
CREATE POLICY "public_newsletter_subscribers_insert" ON "newsletter_subscribers" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((email IS NOT NULL));--> statement-breakpoint
CREATE POLICY "public_newsletter_subscribers_select" ON "newsletter_subscribers" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "public_newsletter_subscribers_update" ON "newsletter_subscribers" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "service_role_only" ON "tickets" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);
*/