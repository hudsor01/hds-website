-- 2026-04-26: NULL out blog feature_image references that point to
-- /images/blog/*.webp files which were never deployed to public/.
--
-- Three posts had paths to images that 404'd in production:
--   beyond-just-works-why-businesses-need-websites-that-dominate
--   how-to-increase-website-conversion-rates-2025-guide
--   small-business-website-cost-2025
--
-- BlogPostCard and BlogPostPage gate their image render on
-- `post.feature_image &&`, so NULLing collapses to no image area —
-- uniform with the 8 other posts that already had NULL feature_image.
--
-- Idempotent: filter clause matches only the legacy /images/blog/* shape.
-- Re-running this file is a no-op once the rows are NULL.
--
-- Applied via Neon SQL on 2026-04-26 alongside PR #168.

UPDATE blog_posts
SET feature_image = NULL
WHERE feature_image LIKE '/images/blog/%';

-- Verification:
-- SELECT slug, feature_image FROM blog_posts WHERE feature_image IS NOT NULL;
-- Should return 0 rows until the n8n pipeline (or a manual upload) sets new paths.
