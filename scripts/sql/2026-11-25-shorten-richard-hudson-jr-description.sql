-- 2026-11-25: Shorten the richardwhudsonjr.com showcase description (QA-10).
--   - The column is the /showcase/richard-hudson-jr meta description, the
--     page lead and the /showcase card copy. At 166 characters it was over
--     the 160-character meta description limit.
--   - "a downloadable resume" becomes "my resume": 154 characters, same facts.
--   - Rollback text (166 chars): 'My own portfolio and resume site as a
--     Dallas-Fort Worth revenue operations professional: 14 interactive case
--     studies, two free RevOps tools and a downloadable resume.'
--   - Apply before the deploy that ships it: getShowcaseBySlug is cached
--     ('use cache', cacheLife days) and the page is prerendered at build.
--
-- Idempotent: matches a single row by slug.

UPDATE showcase
   SET description = 'My own portfolio and resume site as a Dallas-Fort Worth revenue operations professional: 14 interactive case studies, two free RevOps tools and my resume.',
       updated_at = now()
 WHERE slug = 'richard-hudson-jr';
