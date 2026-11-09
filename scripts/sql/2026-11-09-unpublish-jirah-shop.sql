-- 2026-11-09: Take JirahShop off the showcase. The store is paused in
-- production, so the site should not feature it (per Richard). Unpublish
-- rather than delete: the row and its copy stay for a possible relaunch.
-- /showcase/jirah-shop and the old blog case study redirect to /showcase
-- (next.config.ts).
--
-- Idempotent: matches a single row by slug.

UPDATE showcase
   SET published = false,
       featured = false,
       updated_at = now()
 WHERE slug = 'jirah-shop';
