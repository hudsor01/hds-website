-- 2026-11-09: Restore the certifications to the richardwhudsonjr.com showcase.
-- 2026-11-09-correct-richard-hudson-jr-showcase.sql dropped them as "not on
-- the site", but the site's resume (src/app/resume/data/constants.ts in
-- modern-portfolio) lists HubSpot Revenue Operations Certification and
-- SalesLoft Certified Administrator. Replaces the "Delivery" metric.
--
-- Idempotent: matches a single row by slug.

UPDATE showcase
   SET long_description = 'This is my personal site, separate from Hudson Digital Solutions. It shows my revenue operations work to hiring managers and consulting clients through interactive case studies with real charts, a pipeline coverage calculator and a RevOps maturity scorecard that need no email to use, a blog and a resume with my HubSpot Revenue Operations and SalesLoft Certified Administrator certifications.',
       metrics = '{"Case studies": "14 interactive", "Free tools": "2, no email required", "Automated tests": "About 990 unit, 120+ browser", "Certifications": "HubSpot RevOps, SalesLoft Admin"}'::jsonb,
       updated_at = now()
 WHERE slug = 'richard-hudson-jr';
