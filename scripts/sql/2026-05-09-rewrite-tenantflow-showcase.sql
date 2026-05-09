-- 2026-05-09: Rewrite the TenantFlow showcase entry against the actual
-- live product at tenantflow.app and re-publish it.
--
-- Replaces fabricated copy unpublished on 2026-05-08 (#R006/M001/S02):
--   - "automated rent collection / tenant screening" -> these features
--     are NOT on the live product (tenants are never users; ACH is
--     explicitly off; Stripe is for SaaS billing, not tenant->landlord
--     rent collection).
--   - "Free -> $399/month" -> actual tiers are $29 / $79 / Custom.
--   - "10,000+ active users / 4.8-star rating across 1,250 reviews" ->
--     no public review system on the live product; only social-proof
--     element is "Join 500+ Growth subscribers" on the Growth tier
--     pricing card.
--
-- Source of truth: browser audit run on 2026-05-09 against
-- https://tenantflow.app (homepage + /pricing).
--
-- Idempotent: the WHERE predicate matches a single known row id; the
-- UPDATE is a setter, so re-execution is a no-op once the values
-- already match.

UPDATE showcase
   SET
     description = 'Landlord-first property operations SaaS — track properties, tenants, leases, and maintenance in one place. Tenants stay records, never users.',
     long_description = 'Independent landlords and small property managers were stuck managing portfolios in spreadsheets — missed maintenance requests, lost lease documents, and no portfolio-level visibility. Existing property management software was priced for institutional REITs, not the owner of a fourplex. TenantFlow was built to close that gap with a deliberately landlord-only model: tenants are records you manage, never platform users you have to onboard.',
     challenge = 'Small landlords had no affordable, modern operations tooling. Lease documents lived in email threads. Maintenance requests got lost in texts. Existing software demanded that tenants log in, sign up, and learn a new app — friction that killed adoption for portfolios of 1-20 units.',
     solution = 'Built a landlord-only multi-tenant SaaS: portfolio dashboard with property/unit/lease tracking, maintenance request workflows with status, document storage for leases and inspections, and integrated DocuSeal e-signature for new leases. Stripe handles SaaS subscription billing. Supabase backs storage + auth. Resend powers transactional email. 14-day free trial, no credit card required.',
     results = 'Tiered pricing from $29/mo (Starter) to $79/mo (Growth, ~500 subscribers) to Custom (Max, unlimited everything + API access). Annual billing available. Tenants never have to log in — by design, not omission — which removes the largest adoption blocker for sub-20-unit portfolios.',
     technologies = '["Next.js", "TypeScript", "PostgreSQL", "Supabase", "Stripe", "DocuSeal", "Vercel", "Resend", "Tailwind CSS"]'::jsonb,
     metrics = '{"Pricing": "$29 / $79 / Custom mo", "Subscribers": "500+ on Growth tier", "Tenant logins": "Zero (by design)", "Free trial": "14 days, no card"}'::jsonb,
     published = true,
     updated_at = now(),
     published_at = COALESCE(published_at, now())
 WHERE id = '233b4b9c-7817-4fa4-b6de-4e8eb35f7046'
   AND slug = 'tenantflow';

-- Verification:
-- SELECT slug, published, description, metrics
--   FROM showcase WHERE slug = 'tenantflow';
-- Expected: published=true, $29/$79/Custom in description and metrics,
-- no rent-collection or review-count claims.
