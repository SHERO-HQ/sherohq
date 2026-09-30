-- Client work, moved from src/content/work.ts. Only facts SHERO has confirmed
-- are filled in; empty fields show as [bracketed] placeholders on the site
-- until the owner writes them in the admin's Work section.
INSERT INTO "projects" ("slug", "name", "client", "published", "display_order") VALUES
  ('trustcircle', 'TrustCircle', 'Samakose', true, 1),
  ('tastea', 'Tastea', NULL, true, 2),
  ('dajrim', 'Dajrim', NULL, true, 3)
ON CONFLICT ("slug") DO NOTHING;
