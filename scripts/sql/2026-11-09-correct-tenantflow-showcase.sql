-- 2026-11-09: Correct the TenantFlow showcase against the product as it ships
-- (tenantflow.app and the hudsor01/tenant-flow repo, audited 2026-11-09).
--   - Pricing was $29 / $79 / Custom; the live plans are $19 / $49 / $149.
--   - "~500 subscribers" / "500+ on Growth tier" had no source; removed.
--   - DocuSeal was replaced by built-in token e-signing in June 2026.
-- description, long_description and challenge were already accurate.
--
-- Idempotent: matches a single row by slug.

UPDATE showcase
   SET solution = 'Built a landlord-only SaaS on Next.js and Supabase: properties, units, leases, maintenance with vendor assignment, inspections, a document vault and an append-only rent ledger with financial reports. Leases are e-signed through a secure link, so tenants and applicants never need an account. Stripe runs subscription billing, Resend sends email and every table is locked to its landlord with row-level security.',
       results = 'Live at tenantflow.app with three flat plans: Starter $19/mo, Growth $49/mo and Max $149/mo, with a 14-day free trial and no card required. Row-level security is tested against production on every pull request with two separate landlord accounts. Tenants never log in, by design, which removes the biggest adoption blocker for small portfolios.',
       metrics = '{"Pricing": "$19 / $49 / $149 mo", "Free trial": "14 days, no card", "Data isolation": "Row-level security on every table", "Tenant logins": "Zero (by design)"}'::jsonb,
       technologies = '["Next.js", "TypeScript", "PostgreSQL", "Supabase", "Stripe", "Resend", "Sentry", "Vercel", "Tailwind CSS"]'::jsonb,
       updated_at = now()
 WHERE slug = 'tenantflow';
