-- 2026-05-09: Correct fabricated review/rating claims on the Ink 37
-- showcase entry. The live site (ink37tattoos.com) has NO public
-- review surface — no testimonial cards, no star rating, no review
-- count. The current showcase entry claims "4.9-star rating across
-- 127 verified reviews" which would be fabricated social proof (FTC
-- concern flagged in the 2026-05-08 audit, item #17).
--
-- Style list correction: live site offers Custom / American
-- Traditional / Japanese Traditional / Photorealistic. Existing copy
-- said "fine line" which is not on the live services page.
--
-- Source of truth: browser audit run on 2026-05-09 against
-- https://ink37tattoos.com (/, /services, /booking).
--
-- Idempotent: matches single row id.

UPDATE showcase
   SET
     description = 'Booking-first website for a Dallas-Fort Worth tattoo studio (Fernando Govea) — converting Instagram followers into confirmed appointments without the DM back-and-forth.',
     long_description = 'Ink 37 Tattoos had loyal clientele and strong social presence but no website. New customers had to DM on Instagram just to ask about availability. We built a dark-themed, mobile-first site designed for their Instagram audience, with seamless Cal.com booking built in — no third-party redirects, no friction.',
     solution = 'Built a PWA-ready, mobile-first site optimized for the Instagram-to-booking conversion path. Integrated Cal.com directly for one-click appointment booking. Added structured data markup for local SEO visibility across DFW tattoo searches, plus a style-filtered gallery showcasing custom, American traditional, Japanese traditional, and photorealistic work.',
     results = 'Live booking directly on the site eliminated the DM bottleneck entirely. The studio is positioned for DFW local-SEO discoverability and accepts appointments by-appointment-only via Cal.com.',
     technologies = '["Next.js", "React 19", "TypeScript", "Tailwind CSS", "Cal.com", "Structured Data / JSON-LD", "PWA"]'::jsonb,
     metrics = '{"Booking": "Cal.com on-site", "Appointments": "By-appointment-only", "Style range": "4 tattoo specialties", "Pricing range": "$100-$3000+"}'::jsonb,
     updated_at = now()
 WHERE id = 'a0b8b2bc-534b-421d-b046-78805f83a120'
   AND slug = 'ink37-tattoos';

-- Verification:
-- SELECT slug, description, metrics->>'Booking' AS booking,
--        metrics ? 'Reviews' AS has_review_metric
--   FROM showcase WHERE slug = 'ink37-tattoos';
-- Expected: no 'Reviews' or 'Rating' key in metrics; booking via Cal.com.
