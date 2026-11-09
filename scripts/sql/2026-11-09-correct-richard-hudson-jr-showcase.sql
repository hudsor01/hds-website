-- 2026-11-09: Rewrite the richardwhudsonjr.com showcase to match the live site
-- and the modern-portfolio repo (audited 2026-11-09).
--   - It is Richard's own portfolio and resume site, not a client build for
--     "a revenue operations consultant".
--   - Dropped "SalesLoft + HubSpot certifications" (not on the site), "10+
--     years", "$4.8M+" and "432%": the site, its resume and the HDS site
--     disagree on these figures, so none are restated here until Richard
--     settles one set of numbers.
--   - Removed the em-dash in the old solution copy (brand rule).
--
-- Idempotent: matches a single row by slug.

UPDATE showcase
   SET title = 'Revenue Operations Portfolio',
       description = 'My own portfolio and resume site as a Dallas-Fort Worth revenue operations professional: 14 interactive case studies, two free RevOps tools and a downloadable resume.',
       long_description = 'This is my personal site, separate from Hudson Digital Solutions. It shows my revenue operations work to hiring managers and consulting clients through interactive case studies with real charts, a pipeline coverage calculator and a RevOps maturity scorecard that need no email to use, a blog and a resume you can view or download.',
       challenge = 'A resume lists results. A hiring manager or a buyer wants to see how you think. The site had to show RevOps work in a way a PDF cannot, load fast on any device and stay easy to keep current.',
       solution = 'Built on Next.js and React with Neon Postgres, prerendered and served from Vercel''s CDN. The case studies use interactive charts. The contact form is protected with CSRF tokens and rate limiting and sends an automatic reply through Resend. Structured data, a dynamic sitemap and generated social images handle search, and Sentry watches for errors.',
       results = 'Live at richardwhudsonjr.com with 14 case studies, two free tools, a blog with RSS and scheduled publishing and a resume PDF. Every pull request runs linting, type checks, about 990 unit tests, browser tests with accessibility checks and a secret scan.',
       metrics = '{"Case studies": "14 interactive", "Free tools": "2, no email required", "Automated tests": "About 990 unit, 120+ browser", "Delivery": "Prerendered on Vercel''s CDN"}'::jsonb,
       technologies = '["Next.js", "React", "TypeScript", "Tailwind CSS", "Neon Postgres", "Drizzle ORM", "Resend", "Sentry", "Vercel", "JSON-LD"]'::jsonb,
       updated_at = now()
 WHERE slug = 'richard-hudson-jr';
