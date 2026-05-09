-- 2026-05-08: Unpublish the TenantFlow showcase entry whose narrative
-- claims (automated rent collection, $399/mo pricing, 1250 reviews) do
-- not match the live product (R006, M001/S02).
--
-- Per D004 we unpublish (published = false) rather than delete so the
-- row remains available for a future rewrite while disappearing from
-- every public query path. All public selects in src/lib/showcase.ts
-- (getShowcaseItems, getShowcaseBySlug, getAllShowcaseSlugs,
-- getFeaturedShowcase, getShowcaseByType) filter `WHERE published =
-- true`, so flipping the flag immediately hides the entry from the
-- /showcase list, the detail page (returns 404 via notFound()), and
-- generateStaticParams.
--
-- The WHERE clause matches both `slug` and `title` ILIKE patterns for
-- defence in depth -- if either field were edited later the predicate
-- still catches the row.
--
-- Discovery (run first to audit affected rows):
--   SELECT id, slug, title, published, showcase_type, created_at
--     FROM showcase
--    WHERE slug ILIKE '%tenantflow%' OR title ILIKE '%TenantFlow%'
--    ORDER BY created_at DESC;
--
-- On 2026-05-08 the discovery returned 1 published row:
--   - 233b4b9c-7817-4fa4-b6de-4e8eb35f7046
--     slug=tenantflow, title=TenantFlow, showcase_type=detailed
--
-- Idempotent: the `AND published = true` predicate makes re-runs a
-- no-op (UPDATE 0). Verified by re-execution on 2026-05-08.
--
-- How to re-run:
--   1. Apply via Neon MCP `mcp__Neon__run_sql` against project
--      soft-bush-38066584 / database neondb (drizzle-kit push is
--      broken here because pg_cron and hypopg are installed -- see
--      CLAUDE.md). Local execution via
--      `psql "$POSTGRES_URL" -f <this-file>` also works.
--   2. Confirm post-state with the verification SELECT below.
--
-- Applied via local psql against POSTGRES_URL on 2026-05-08
-- (1 row updated on first run, 0 on the idempotency re-run).

UPDATE showcase
   SET published = false,
       updated_at = now()
 WHERE (slug ILIKE '%tenantflow%' OR title ILIKE '%TenantFlow%')
   AND published = true;

-- Verification:
-- SELECT count(*) FROM showcase
--   WHERE (slug ILIKE '%tenantflow%' OR title ILIKE '%TenantFlow%')
--     AND published = true;
-- Should return 0.
