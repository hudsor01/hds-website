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

## Current milestone

**v3.0 — Showcase & conversion polish.** Started after PR #206 (copy repositioning) and PR #207 (Tennessee/health-route cleanup) shipped to main on 2026-05-21.

## What's in scope for GSD work

Frontend UI/UX improvements to the marketing site. Each meaningful change goes through brainstorm → spec → plan → execute with atomic commits and code review.

## What's out of scope

- Backend / database schema changes (existing schema is locked unless explicitly opened)
- Third-party integrations beyond what's already wired (Resend, Vercel, Neon)
- Pricing changes
- Authentication / user accounts (the site has none and won't)
