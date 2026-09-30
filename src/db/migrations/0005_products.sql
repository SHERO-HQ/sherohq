CREATE TYPE "public"."product_status" AS ENUM('in_development', 'live');--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"status" "product_status" DEFAULT 'in_development' NOT NULL,
	"theme" text DEFAULT 'shero' NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"problem" text NOT NULL,
	"audience" text NOT NULL,
	"compare" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"preview_url" text,
	"live_url" text,
	"name_placeholder" text DEFAULT 'Ama Mensah' NOT NULL,
	"business_label" text DEFAULT 'Business name' NOT NULL,
	"business_placeholder" text DEFAULT '' NOT NULL,
	"detail_label" text NOT NULL,
	"detail_placeholder" text DEFAULT '' NOT NULL,
	"detail_numeric" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_slug_format" CHECK ("products"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "products_live_has_url" CHECK ("products"."status" <> 'live' or "products"."live_url" is not null)
);
--> statement-breakpoint
ALTER TABLE "waitlist_signups" ADD COLUMN "product_id" uuid;--> statement-breakpoint
ALTER TABLE "waitlist_signups" ADD CONSTRAINT "waitlist_signups_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
-- SHERO's two products, moved from src/content/products.ts with their copy.
INSERT INTO "products" ("slug", "name", "status", "theme", "title", "summary", "problem", "audience", "compare", "name_placeholder", "business_label", "business_placeholder", "detail_label", "detail_placeholder", "detail_numeric", "published", "display_order") VALUES ('merchander', 'Merchander', 'in_development', 'merchander', 'One place to run a business that sells on social media.', 'Run a business that sells on WhatsApp and Instagram from one place: orders, payments, stock and pre-orders.', 'If you sell on WhatsApp or Instagram, your business lives in chats, screenshots and notebooks. Orders get lost, payments are hard to confirm, and pre-orders for imported goods are tracked by memory.', 'Merchants who sell through social media: importers, resellers, boutiques and other small businesses.', '[{"today": "Orders scattered across chats and screenshots", "with": "Every order from WhatsApp and Instagram in one list"}, {"today": "Payments checked by scrolling through MoMo messages", "with": "Payments recorded, with a digital receipt for every sale"}, {"today": "Stock counted by hand, often wrong", "with": "Stock that updates itself, even when the internet drops"}, {"today": "Pre-orders for imports tracked from memory", "with": "Pre-orders tracked from deposit to delivery"}]'::jsonb, 'Ama Mensah', 'Business name', 'Ama''s Imports', 'What do you sell?', 'Bags and shoes', false, true, 1);
--> statement-breakpoint
INSERT INTO "products" ("slug", "name", "status", "theme", "title", "summary", "problem", "audience", "compare", "name_placeholder", "business_label", "business_placeholder", "detail_label", "detail_placeholder", "detail_numeric", "published", "display_order") VALUES ('pharmasyst', 'Pharmasyst', 'in_development', 'pharmasyst', 'Sales and stock for pharmacies with labs.', 'Sales, stock across branches and NHIS-ready claims for pharmacies with labs.', 'Pharmacies with labs and several branches juggle sales, stock, expiry dates and insurance claims across separate systems or paper. Stock runs out at one branch while another has plenty, and NHIS claims take hours to prepare.', 'Pharmacies with labs, especially those with more than one branch.', '[{"today": "Sales written up and totalled by hand", "with": "Pharmacist prepares the sale, cashier takes payment, all in one flow"}, {"today": "Each branch keeps its own stock count", "with": "Stock and expiry dates visible across every branch"}, {"today": "NHIS claims prepared from paper at month end", "with": "NHIS details captured at the counter, claims exported"}, {"today": "Payments reconciled separately from sales", "with": "MoMo and card payments recorded against each sale"}]'::jsonb, 'Kwame Asante', 'Pharmacy name', 'Kwame''s Pharmacy', 'Number of branches', '3', true, true, 2);
--> statement-breakpoint
-- Existing signups point at their product.
UPDATE "waitlist_signups" w SET "product_id" = p."id" FROM "products" p WHERE p."slug" = w."product"::text;