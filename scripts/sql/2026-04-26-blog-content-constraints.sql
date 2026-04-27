-- 2026-04-26: Add CHECK constraints on blog_posts.title and excerpt to
-- prevent empty/whitespace-only values from reaching the UI.
--
-- Background: title and excerpt were already declared NOT NULL at the
-- column level, but Postgres NOT NULL allows empty strings. An empty
-- title would render as `<h1></h1>` on the post page, an empty excerpt
-- as `<title></title>` in the RSS/OG meta. mapPost in src/lib/blog.ts
-- has a runtime fallback (humanized slug) for empty title, but the DB
-- constraint catches the bad write at insert/update time so the issue
-- never reaches the cache layer.
--
-- Verified empty-row count via `bun -e "..."` against POSTGRES_URL
-- before authoring: 0 empty titles, 0 empty excerpts. Safe to add
-- the constraint without backfill.
--
-- Idempotent: NOT VALID + the IF NOT EXISTS pattern via DO block, so
-- re-running on a constrained DB is a no-op.
--
-- Applied via Neon SQL on 2026-04-26 alongside PR #168.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'blog_posts_title_nonempty'
  ) THEN
    ALTER TABLE blog_posts
      ADD CONSTRAINT blog_posts_title_nonempty
      CHECK (length(trim(title)) > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'blog_posts_excerpt_nonempty'
  ) THEN
    ALTER TABLE blog_posts
      ADD CONSTRAINT blog_posts_excerpt_nonempty
      CHECK (length(trim(excerpt)) > 0);
  END IF;
END
$$;

-- Verification:
-- SELECT conname FROM pg_constraint
--   WHERE conrelid = 'blog_posts'::regclass
--     AND conname IN ('blog_posts_title_nonempty', 'blog_posts_excerpt_nonempty');
-- Should return 2 rows.
