-- Add costPrice to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS "costPrice" DECIMAL(10, 2) DEFAULT 0.00;

-- Add cogs to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cogs DECIMAL(10, 2) DEFAULT 0.00;
