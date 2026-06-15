---
phase: 14
slug: admin-page-title
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-02
---

# Phase 14 — Validation Strategy

> Per-phase validation contract. Derived from 14-RESEARCH.md. Tiny chrome change: the per-page title already exists on all 18 admin routes (own `<h1>` + `metadata.title`); the fix removes the redundant, always-"Admin" Topbar prop. Verification is build/typecheck/grep + visual (honest: almost no unit-test surface).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | bun:test (+ optional RTL render test) |
| **Quick run command** | `bun run typecheck` (proves the prop is removed at every consumer — single consumer) |
| **Gates** | `bun run lint && bun run typecheck && bun run test:unit && bun run build` |

---

## Sampling Rate

- **After the edit:** `bun run typecheck` (catches any missed consumer) + `bun run build` (admin routes must still PPR).
- **Before verify:** full gate chain green.

---

## Per-Requirement Verification Map

| Requirement | Correct Behavior | Test Type | Automated Command | Status |
|-------------|------------------|-----------|-------------------|--------|
| ADMINUX-01 | `Topbar` no longer accepts/renders a `pageTitle` prop; `layout.tsx` no longer passes the hardcoded `pageTitle="Admin"`; each admin page's own `<h1>` / `metadata.title` is the sole title source (already present); no universal "Admin" label remains | source grep + typecheck + build | `! grep -rn "pageTitle" src/components/admin/Topbar.tsx 'src/app/(admin)/admin/layout.tsx'` + `bun run typecheck` + `bun run build` | ⬜ pending |

---

## Wave 0 Requirements

- No new test infra. Optional `tests/unit/admin-topbar.test.tsx` render test (low value) confirming the Topbar renders the wordmark + AccountMenu without a pageTitle prop.
- No new framework, no new dependency.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Each admin route shows its correct heading (its own `<h1>`), and the topbar no longer shows a redundant "Admin" label on every page | ADMINUX-01 | Visible chrome across authenticated admin routes; no unit surface for the layout/topbar composition (auth-gated) | Load each `/admin/*` route; confirm the page heading is the page's real title and the topbar carries no stale "Admin" duplicate |

---

## Validation Sign-Off

- [x] All tasks have automated verify (typecheck/build/grep) or are manual-visual by nature
- [x] Sampling continuity: typecheck + build gate the single change
- [x] Wave 0: none required
- [x] No watch-mode flags
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-06-02 (tiny chrome change; verification is build/typecheck/grep + visual per research)
