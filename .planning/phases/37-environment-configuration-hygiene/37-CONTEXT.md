# Phase 37: Environment & Configuration Hygiene - Context

**Gathered:** 2026-02-11
**Status:** Ready for planning

<vision>
## How This Should Work

A clean sweep across all environment and configuration concerns in one pass. Every env var the app uses should flow through env.ts validation — no more bypassing the validation layer and reading process.env directly. Stale Supabase-era references should be fully gone from config files. The CSP reports empty string bug gets fixed. When this phase is done, configuration is airtight: misconfigurations fail fast at startup, not silently at runtime.

</vision>

<essential>
## What Must Be Nailed

- **Fail-fast env validation** - env.ts must catch every env var (POSTGRES_URL, NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET, STIRLING_PDF_URL) so bad configurations blow up immediately
- **No stale references** - Supabase era is fully behind us, zero leftover references in config/env files
- **CSP empty string fix** - The empty string in EXPECTED_CSP_FIELDS array gets cleaned up

</essential>

<boundaries>
## What's Out of Scope

- No specific exclusions — address the three audit findings and move on
- Developer onboarding / .env.example accuracy is low priority (solo repo, no one clones it)

</boundaries>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<notes>
## Additional Context

This is a solo/private repo — developer onboarding docs and .env.example quality don't matter much. The focus is on runtime safety (fail-fast validation) and cleaning up migration debt from the Supabase-to-Neon transition.

</notes>

---

*Phase: 37-environment-configuration-hygiene*
*Context gathered: 2026-02-11*
