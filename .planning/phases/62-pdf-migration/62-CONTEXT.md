# Phase 62: React-PDF Template Migration + Dead HTML Template Cleanup - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning. Depends on phase 61 (BRAND export from src/lib/_generated/brand.ts).

<domain>
## Phase Boundary

Migrate the React-PDF (`@react-pdf/renderer` 4.5.1) template StyleSheets to consume hex values from the generated `BRAND` constant established in phase 61. Delete the dead `.ts` HTML PDF templates that have zero importers (legacy code from a prior Puppeteer-based PDF approach).

React-PDF's StyleSheet API does NOT support oklch (only hex/rgb per documented examples and the absence of any oklch parser in `@react-pdf/stylesheet` source). This is precisely why the codegen layer from phase 61 exists — React-PDF templates import `BRAND.primary` (a hex string derived from globals.css) and there is no drift.

</domain>

<decisions>
## Implementation Decisions

### Locked Decisions

- **Dead code DELETE, do not migrate**: `src/lib/pdf/contract-html-template.ts` and `src/lib/pdf/invoice-html-template.ts` have ZERO importers (verified — `grep -rln "contract-html-template\|invoice-html-template" src/` returns empty). Both files are 16k + 7.5k of unused HTML email-style templates from a prior approach. They get DELETED in this phase, not migrated.
- **Active templates** (the `.tsx` files using @react-pdf/renderer):
  - `src/lib/pdf/contract-template.tsx` — 4 cyan refs
  - `src/lib/pdf/proposal-template.tsx` — 8 cyan refs
  - `src/lib/pdf/invoice-template.tsx` — 9 cyan refs (with `// cyan-600` comments to remove)
  - `src/lib/pdf/paystub-template.tsx` — verify whether it has cyan; if yes, migrate; if no, no-op
- **Pattern**: each template imports `BRAND` from `@/lib/_generated/brand`, references `BRAND.primary` (and any other tokens needed) inside `StyleSheet.create({ ... })`. The `// cyan-600` comments are removed (the import statement makes the source obvious).
- **stirling-client.ts**: read this file to understand if it's an alternate PDF rendering path (Stirling-PDF service) — not in scope for cyan migration unless it has hex literals
- **client-pdf.ts**: read this file — likely orchestration; check for hex literals
- **Puppeteer dependency**: leave alone in package.json for now. It's not used in src/ but may be referenced by tests, scripts, or build tooling. Removing it is OUT OF SCOPE for v4.1.

### Claude's Discretion

- Whether to also remove the `// cyan-600` comments individually OR mass-strip them via a single sd pass
- Whether to introduce a local `colors` const at the top of each template (`const colors = { brand: BRAND.primary, ... }`) OR reference `BRAND.primary` inline at each use site (recommend inline — simpler, fewer indirections, the import statement IS the namespace)

### Out of Scope

- Removing puppeteer from dependencies (separate hygiene task, not v4.1)
- Refactoring React-PDF templates beyond color migration (no markup or layout changes)
- Migrating client-pdf.ts orchestration unless it has cyan literals
- Touching stirling-client.ts unless it has cyan literals
- Adding dark-mode PDF variants

</decisions>

<specifics>
## Surfaces in Scope

### Files to DELETE
- `src/lib/pdf/contract-html-template.ts` (16k, dead code)
- `src/lib/pdf/invoice-html-template.ts` (7.5k, dead code)

### Files to MIGRATE (React-PDF .tsx StyleSheets)
- `src/lib/pdf/contract-template.tsx` lines 24, 29, 44, 69 — `borderBottomColor`, three `color` properties
- `src/lib/pdf/proposal-template.tsx` lines 33, 65, 76, 84, 96, 113, 141, 172 — multiple `color`, `borderBottomColor`, `backgroundColor`
- `src/lib/pdf/invoice-template.tsx` lines 26, 34, 67, 101, 161, 168, 175, 186, 211 — multiple `color`, `borderBottomColor`, `backgroundColor`, `borderTopColor`. Also remove `// cyan-600` comments.

### Files to AUDIT (read first; migrate only if hex literals found)
- `src/lib/pdf/paystub-template.tsx` — initial grep showed no cyan but verify other hex literals
- `src/lib/pdf/client-pdf.ts` — orchestration; verify
- `src/lib/pdf/stirling-client.ts` — Stirling integration; verify

</specifics>

<verification>
## Phase-Level Verification

After both plans complete:
- `ls src/lib/pdf/` — the two `*-html-template.ts` files no longer exist
- `grep -rnE "#0891b2|#06b6d4|#0e7490" src/lib/pdf/` returns ZERO matches
- `grep -rn "// cyan" src/lib/pdf/` returns zero matches (cleanup of stale comments)
- `bun run typecheck && bun run lint && bun run test:unit` all pass
- Visual smoke: render one of each PDF type (contract, proposal, invoice, paystub) — confirm slate-blue brand bar/headings, no broken layout
- `bun run build` succeeds
</verification>
