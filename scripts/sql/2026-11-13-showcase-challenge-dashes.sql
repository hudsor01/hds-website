-- 2026-11-13: Remove em dashes from showcase.challenge (user-facing text;
-- CLAUDE.md bans em/en dashes in shipped strings). Wording otherwise kept.
--
-- Previous values (for reversal):
--   ink37-tattoos: '... before a booking could even be attempted — a slow,
--     leaky funnel for a business driven by impulse decisions.'
--   tenantflow: '... demanded that tenants log in, sign up, and learn a new
--     app — friction that killed adoption for portfolios of 1-20 units.'
--
-- Idempotent: each UPDATE matches on slug and only rewrites the sentence.

UPDATE showcase
   SET challenge = 'The studio was losing potential clients to competitors with easier online booking. Every new inquiry required a manual Instagram DM exchange before a booking could even be attempted: a slow, leaky funnel for a business driven by impulse decisions.',
       updated_at = now()
 WHERE slug = 'ink37-tattoos';

UPDATE showcase
   SET challenge = 'Small landlords had no affordable, modern operations tooling. Lease documents lived in email threads. Maintenance requests got lost in texts. Existing software demanded that tenants log in, sign up and learn a new app, friction that killed adoption for portfolios of 1 to 20 units.',
       updated_at = now()
 WHERE slug = 'tenantflow';

-- Verification:
-- SELECT slug FROM showcase WHERE challenge ~ '[–—]';  -- expect 0 rows
