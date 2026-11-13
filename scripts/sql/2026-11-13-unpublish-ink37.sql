-- 2026-11-13: Take Ink 37 Tattoos off the showcase. ink37tattoos.com is
-- paused in production (Vercel DEPLOYMENT_PAUSED), so the site should not
-- feature it (per Richard, same call as JirahShop). Unpublish rather than
-- delete: the row and its copy stay for a possible relaunch.
-- /showcase/ink37-tattoos and the removed blog case study redirect to
-- /showcase (next.config.ts).
--
-- Idempotent: matches a single row by slug.

UPDATE showcase
   SET published = false,
       featured = false,
       updated_at = now()
 WHERE slug = 'ink37-tattoos';
