# ROADMAP — Hudson Digital Solutions

## Milestone v3.0 — Showcase & conversion polish

> Started 2026-05-21. Site copy was repositioned in v2.x (PR #206). v3.0 focuses on visual storytelling and conversion surfaces.

### Phases

| # | Slug | Status | Plans | Description |
|---|---|---|---|---|
| 01 | `showcase-ui-redesign` | complete (4/4) | 4 | Redesign `/showcase` around real homepage screenshots: featured project (JirahShop e-commerce) + 3 supporting cards (Ink 37, TenantFlow, RevOps Portfolio) + inline mid-scroll CTA. Spec at `.planning/phases/01-showcase-ui-redesign/01-CONTEXT.md`. Phase summary at `.planning/phases/01-showcase-ui-redesign/01-SUMMARY.md`. |

### Phase 01: showcase-ui-redesign

**Goal:** Turn `/showcase` into an image-led conversion surface. 4 published rows (1 featured, 3 support) all render with real homepage screenshots; a mid-scroll CTA appears between the grid and the closing CTA; hero typewriter is preserved; all new copy is em/en-dash free.

**Plans:** 4 plans across 3 waves

Plans:
- [x] 01-01-PLAN.md — Populate Neon `showcase` table: UPDATE imageUrl on 3 existing rows + INSERT jirah-shop row (featured, first by displayOrder)
- [x] 01-02-PLAN.md — Extend `Card variant="project"` with optional `imageUrl` / `imageAlt` props and a conditional Next.js Image header (4:3 featured, 16:9 support)
- [x] 01-03-PLAN.md — Rewrite `src/app/showcase/page.tsx`: new section header, featured-first split logic, 3-col support grid, new inline CTA section, strip em/en-dash from existing hero/metadata copy
- [x] 01-04-PLAN.md — Verification: lint + typecheck + build + em/en-dash grep + human visual smoke on local dev (automated gates green; human smoke deferred to operator pre-PR)

**Wave structure:**
- Wave 1 (parallel): 01-01 (data), 01-02 (component) — no file overlap, both prerequisites for the page rewrite
- Wave 2: 01-03 (page rewrite, depends on data and component)
- Wave 3: 01-04 (verification, depends on all)

## Earlier milestones (archived)

- v1.0 — 10 phases, shipped
- v1.1 — 2/7 phases done, rest deferred
- v2.0 — 8 phases, shipped (final phase: copy repositioning, PR #206)
