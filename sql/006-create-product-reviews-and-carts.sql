

CREATE TABLE IF NOT EXISTS abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT REFERENCES users(id) ON DELETE CASCADE,
  "guestId" VARCHAR(255),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  "lastActive" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "emailSent" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_abandoned_carts_user_id ON abandoned_carts("userId");
CREATE UNIQUE INDEX IF NOT EXISTS idx_abandoned_carts_guest_id ON abandoned_carts("guestId");
