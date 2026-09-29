CREATE TABLE "delivery_rates" (
	"region" text PRIMARY KEY NOT NULL,
	"fee_pesewas" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "delivery_rates_fee_not_negative" CHECK ("delivery_rates"."fee_pesewas" >= 0)
);
--> statement-breakpoint
-- One row per region plus Tamale local delivery; fees are set by the owner in Settings.
INSERT INTO "delivery_rates" ("region") VALUES ('Ahafo'),('Ashanti'),('Bono'),('Bono East'),('Central'),('Eastern'),('Greater Accra'),('North East'),('Northern'),('Oti'),('Savannah'),('Upper East'),('Upper West'),('Volta'),('Western'),('Western North'),('Tamale (local delivery)') ON CONFLICT DO NOTHING;
