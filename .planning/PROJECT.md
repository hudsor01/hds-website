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

## Current Milestone: v6 Audit Remediation

**Goal:** Canonically correct every finding from the no-op/stub audit so the codebase contains no functionality that silently fails to do what its name, signature, or UI copy promises.

**Target features:**
- Paystub calculator tells the truth about tax accuracy (no silent $0 state tax for unsupported states; no dead year toggle).
- The "Report Error" action either reports or is removed, and never claims a report was filed when none was sent.
- Dead/dangling code removed (phantom fields, dangling stub comments, unused no-op methods).
- Admin pages distinguish a real DB failure from genuinely-empty data with a visible error state.
- Every intentional no-op is recorded as verified-intentional so future audits recognize it.

**Source of truth:** `.planning/v6-AUDIT-FINDINGS.md` (full findings + dispositions).

**Milestone decisions:**
- **Admin DB-error handling: full error states everywhere.** This supersedes the v4 locked decision ("each admin query wraps in try/catch and returns [] on failure"). Admin list/widget/queue/detail surfaces must distinguish "query failed" from "no data".
- **Admin pageTitle:** approach (native Next.js 16 metadata/title template vs per-page heading) to be chosen by researching the most-performant canonical option during that phase's planning.

> **Prior milestone:** v3.0 - Showcase & conversion polish (shipped). v4 (Admin Panel) and v5 (admin pagination, logger compliance, route groups) shipped after. See `.planning/ROADMAP.md` and `.planning/STATE.md` for full history.

## What's in scope for GSD work

Frontend UI/UX improvements to the marketing site. Each meaningful change goes through brainstorm → spec → plan → execute with atomic commits and code review.

## What's out of scope

- Backend / database schema changes, EXCEPT removing the phantom `HelpArticle.order_index` field (no DDL: it references a column that never existed)
- New third-party integrations beyond what's already wired (Resend, Vercel, Neon, Better Auth)
- Pricing changes
- New paystub state tax bracket data (v6 fixes the silent-$0 lie by scoping selectable states to supported data, not by adding 37 states of bracket data)

---
*Last updated: 2026-06-01 (v6 Audit Remediation milestone start)*
