-- 2026-06-20: Migrate showcase case-study copy into Richard Hudson's voice
-- (first person, operator tone), matching the blogs and core marketing
-- pages. Also fixes brand-rule violations present in the existing copy:
-- em-dashes (Ink 37, TenantFlow, portfolio long), the AI-tell word
-- "seamless" (Ink 37), Oxford comma-before-"and" (JirahShop, TenantFlow,
-- portfolio), and "we built" -> "I built".
--
-- NOTE for review: the richard-hudson-jr (RevOps portfolio) entry cites
-- "$4.8M+ documented revenue impact". The blogs/About cite "$3.7M pipeline
-- through forecasting". Left $4.8M as-is (it reads as a separate, broader
-- career figure) - confirm both are accurate or reconcile.
--
-- Idempotent: each statement matches a single row by slug.

UPDATE showcase
   SET description = 'Booking-first website for a Dallas-Fort Worth tattoo studio (Fernando Govea) that turns Instagram followers into confirmed appointments, no DM back and forth.',
       long_description = 'Ink 37 Tattoos had loyal clients and a strong social presence but no website. New customers had to DM on Instagram just to ask about availability. I built a dark, mobile-first site for their Instagram audience with Cal.com booking wired in directly. No third-party redirects, no friction.'
 WHERE slug = 'ink37-tattoos';

UPDATE showcase
   SET description = 'Curated Asian beauty store featuring K-beauty and J-beauty essentials, own-brand formulations and expert picks for every skin type.'
 WHERE slug = 'jirah-shop';

UPDATE showcase
   SET description = 'Personal brand site for a revenue operations consultant with $4.8M+ in documented revenue impact across mid-market clients.',
       long_description = 'A seasoned RevOps consultant with SalesLoft and HubSpot certifications needed a personal site that matched the credibility of his results. I built something clean, fast and professional that opens doors with enterprise buyers.'
 WHERE slug = 'richard-hudson-jr';

UPDATE showcase
   SET description = 'Landlord-first property operations SaaS. Track properties, tenants, leases and maintenance in one place. Tenants stay records, never users.',
       long_description = 'Independent landlords and small property managers were stuck managing portfolios in spreadsheets: missed maintenance requests, lost lease documents and no portfolio-level visibility. Existing property management software was priced for institutional REITs, not the owner of a fourplex. I built TenantFlow to close that gap with a deliberately landlord-only model: tenants are records you manage, never platform users you have to onboard.'
 WHERE slug = 'tenantflow';
