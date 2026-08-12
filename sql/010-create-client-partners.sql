-- 010-create-client-partners.sql
-- Table for managing client and partner logos dynamically from the Admin dashboard

CREATE TABLE IF NOT EXISTS client_partners (
    id text PRIMARY KEY,
    name text NOT NULL,
    tagline text,
    logo text NOT NULL,
    website text,
    category text DEFAULT 'Client',
    "order" integer DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Index for ordering active partners
CREATE INDEX IF NOT EXISTS idx_client_partners_active_order ON client_partners (active, "order");

-- Seed initial clients if empty
INSERT INTO client_partners (id, name, tagline, logo, category, "order", active)
VALUES 
('dajrim', 'Dajrim', 'Operations Platform', '/assets/images/clients/dajrim.png', 'Client', 1, true),
('samakose', 'Samakose', 'Financial Ecosystem', '/assets/images/clients/samakose.png', 'Client', 2, true),
('trustcircle', 'TrustCircle', 'Community Network', '/assets/images/clients/trustcircle.webp', 'Client', 3, true)
ON CONFLICT (id) DO UPDATE 
SET logo = EXCLUDED.logo, tagline = EXCLUDED.tagline;
