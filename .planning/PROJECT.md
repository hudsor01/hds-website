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

## Current Milestone: v7 Stability & Maintenance

**Goal:** Make the test suite trustworthy and the dependencies current, so CI is a reliable signal and the project stays on supported library versions.

**Target features:**
- The full `bun test tests/` run is order-independent and matches isolated runs (0 fail). The ~21 homepage/navigation/Footer RTL failures are eliminated by root-causing and fixing bun's process-global `mock.module` leak, not by patching the symptom; a guard prevents reintroduction.
- The 5 open Dependabot PRs are reviewed, verified (auth flows for better-auth; the blog rich-text editor for the Tiptap bumps), and the safe ones merged onto current `main`.

**Milestone decisions:**
- **Fix the root cause, not the symptom:** the test-pollution is a bun `mock.module` global-registry leak (un-cleared by `mock.restore()`) — fix the leaking tests so the suite is order-independent; do not suppress/skip the failing tests.
- **Sequence:** test-isolation first, then dependency currency — the dep PRs' CI Test job hits the same pollution (e.g. #331 is failing), so a clean suite makes their CI trustworthy.

**Source of truth:** the bun mock.module lesson in project memory (`feedback_bun_mock_module_global_pollution.md`) + the v6 deferred-items log.

> **Prior milestones:** v6 Audit Remediation closed (audit PASSED, `.planning/milestones/v6-AUDIT.md`). v3 / v4 / v5 shipped earlier. See `.planning/ROADMAP.md` + `.planning/STATE.md` for full history.

## What's in scope for GSD work

Frontend UI/UX improvements to the marketing site. Each meaningful change goes through brainstorm → spec → plan → execute with atomic commits and code review.

## What's out of scope

- Backend / database schema changes, EXCEPT removing the phantom `HelpArticle.order_index` field (no DDL: it references a column that never existed)
- New third-party integrations beyond what's already wired (Resend, Vercel, Neon, Better Auth)
- Pricing changes
- New paystub state tax bracket data (v6 fixes the silent-$0 lie by scoping selectable states to supported data, not by adding 37 states of bracket data)

---
*Last updated: 2026-06-01 (v6 Audit Remediation milestone start)*
