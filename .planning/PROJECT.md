# PROJECT.md — Hudson Digital Solutions Marketing Site

> **Single source of truth for project conventions** lives in `/CLAUDE.md`.
> This file captures GSD-specific framing: positioning, current scope, and what GSD work targets.

## What this project is

The marketing site for Hudson Digital Solutions: a one-developer web design & build service for small businesses, based in Dallas Fort Worth. The site sells exactly one thing: a professional website for a small business that has earned the reputation but never got the site.

## Tech Stack (summary; see `/CLAUDE.md` for full details)

- Next.js 16 (App Router) + React 19
- TypeScript strict, Bun 1.3.x, Biome 2.4.4
- Neon Postgres + Drizzle ORM
- Tailwind v4 via `@theme` + `@utility` blocks in `src/app/globals.css`
- Vercel hosting

## Active positioning (locked)

- Headline offer: **website design & build for small businesses**
- Primary target: local businesses with strong Google reviews but no website (or a dated one)
- Secondary, demoted offer: connecting site to booking, payments, and follow-up. Not the headline.
- Site-wide CTA: `Get My Free Website Plan`
- Banned in copy: em-dash (—), en-dash (–). Replace with comma, period, hyphen, or `to` for ranges. Codified in `CLAUDE.md`.

## Current Milestone: v8 Hardening

**Goal:** Close the issues surfaced by the post-v7 repo review (two reviewer agents + `bun audit` + `fallow` code-intelligence): patch known dependency vulnerabilities, fix the real correctness bugs, and clean up conventions / dead code / duplication — so the production code is secure, contract-correct, and lean.

**Target features:**
- **Dependency security:** the 5 known vulnerabilities (`fast-uri` x2 high, `postcss`, `brace-expansion` moderate) are patched or risk-accepted with rationale; `bun audit` is clean or every remaining advisory is documented transitive-build-only.
- **Correctness:** the scheduled-email queue cannot double-send (atomic claim before send); the rate-limiter's in-memory fallback is bounded during a Redis outage and its Redis path is atomic; the `testimonials/[id]` endpoints return correct 404/400 (not 200/500); public calculator submissions cannot store unbounded JSON.
- **Hygiene:** no user-facing em/en-dash (fix `pagespeed:217`); dead exports/types pruned; `flattenZod`/`ActionResult` and the `NewsletterSignup` self-duplication deduped; unsound `error as Error` casts dropped; stale `CLAUDE.md` (`src/lib/errors.ts`) corrected; favicons (`icon0`/`icon1`) confirmed serving.

**Milestone decisions:**
- **Source of truth = the verified review findings** (this session). Each finding was marked VERIFIED (confirmed in code) or REPORTED; fix the verified ones, re-verify the REPORTED ones at plan time. Two fallow false-positives are excluded: `icon0`/`icon1` are Next icon routes (not dead), and the duplicate `deleteTestimonial` is an intentional documented re-export.
- **Sequence:** Phase 19 dependency-security (isolated, fast) -> Phase 20 correctness-bugs (tested fixes) -> Phase 21 code-hygiene. Each ships as its own code-only PR.

> **Prior milestones:** v7 Stability and Maintenance closed (audit PASSED, `.planning/milestones/v7-AUDIT.md`); v6 Audit Remediation closed (`v6-AUDIT.md`). v3 / v4 / v5 shipped earlier. See `.planning/ROADMAP.md` + `.planning/STATE.md` for full history.

## What's in scope for GSD work

Frontend UI/UX improvements to the marketing site. Each meaningful change goes through brainstorm → spec → plan → execute with atomic commits and code review.

## What's out of scope

- Backend / database schema changes, EXCEPT removing the phantom `HelpArticle.order_index` field (no DDL: it references a column that never existed)
- New third-party integrations beyond what's already wired (Resend, Vercel, Neon, Better Auth)
- Pricing changes
- New paystub state tax bracket data (v6 fixes the silent-$0 lie by scoping selectable states to supported data, not by adding 37 states of bracket data)

---
*Last updated: 2026-06-01 (v6 Audit Remediation milestone start)*
