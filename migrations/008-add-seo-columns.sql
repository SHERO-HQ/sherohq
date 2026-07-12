-- Add SEO columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS "metaTitle" VARCHAR(60);
ALTER TABLE products ADD COLUMN IF NOT EXISTS "metaDescription" VARCHAR(160);
