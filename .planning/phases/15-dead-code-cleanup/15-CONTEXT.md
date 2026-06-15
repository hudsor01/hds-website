# Phase 15: dead-code-cleanup - Context

**Gathered:** 2026-06-02
**Status:** Ready for planning
**Source:** Synthesized from `.planning/v6-AUDIT-FINDINGS.md` findings #5, #6 + the CLEANUP bucket, with call-site verification already performed (see dispositions).

<domain>
## Phase Boundary

Remove genuinely dead/dangling code surfaced by the audit, and put a clear comment on the two "no-op today but intentionally retained" items so they stop reappearing in future audits. CLEAN-01..03. Pure subtraction + a couple of comment clarifications; no behavior change.

**In scope:** `src/lib/notifications.ts`, `src/lib/help-articles.ts`, `src/lib/logger.ts`, `src/emails/contact-welcome.tsx`, `src/lib/ttl-calculator/calculator.ts` (+ a clarifying comment), and any test touched by the above.

**Out of scope:** any behavior change; the intentional env-gated no-ops (those are Phase 16 / NOOP-01); anything beyond CLEAN-01..03.
</domain>

<decisions>
## Implementation Decisions (LOCKED — informed by call-site verification)

### CLEAN-01 — dangling "Test notification endpoints" stub (DELETE)
- `src/lib/notifications.ts` ends with a dangling `/** Test notification endpoints */` JSDoc block and NO function under it. No call sites. DELETE the dangling block. (YAGNI; do NOT implement a phantom `sendTestNotification`.)

### CLEAN-02 — phantom `HelpArticle.order_index` (DELETE)
- `src/lib/help-articles.ts`: `order_index: number` (interface, ~line 23) and `order_index: 0` (mapper, ~line 88). The `help_articles` table has NO such column; all queries order by `createdAt`; the field is a permanently-constant `0` no value backs. DELETE both. Research must confirm NO consumer reads `order_index` (then it's a safe delete; if a consumer exists, surface it).

### CLEAN-03a — logger `group`/`groupEnd`/`table` no-op methods (DELETE — TWO FILES)
- ZERO callers across src/tests/e2e (research-confirmed). DELETE the method bodies in `src/lib/logger.ts` (~lines 321-333) AND the three matching members from the `Logger` interface in `src/types/logger.ts` (~lines 71-76). CRITICAL: `BaseLogger implements Logger`, so deleting only the bodies triggers TS2420 and breaks the build — both files must change together.

### CLEAN-03b — `contact-welcome` `PARAGRAPH_STYLE.whiteSpace` (KEEP + justify)
- `src/emails/contact-welcome.tsx`: `whiteSpace: 'pre-wrap'` IS applied (`PARAGRAPH_STYLE` is used on the `<Text>` at ~line 47). It is currently inert only because no sequence template contains intra-paragraph `\n`, but it is intentional DEFENSIVE styling (preserves soft line breaks if future copy adds them). DISPOSITION: KEEP. Tighten the existing comment to state it is currently inert-but-defensive (so a future audit recognizes it as intentional). Do NOT remove it (removing risks silently breaking soft-linebreak rendering later). This satisfies CLEAN-03's "else documented".

### CLEAN-03c — ttl-calculator `processingFees` always-0 (REMOVE — research-corrected)
- Research correction: `processingFees` is **read-but-never-rendered** — `ResultsPanel.tsx` and `ComparisonView.tsx` render NO processing-fee row; `Calculator.tsx:146` only copies it into a comparison object that itself never displays it. So it is a genuinely vestigial always-0 field (the `PROCESSING_FEE 4.75` is already folded into `registrationFees`), exactly the kind of no-op this phase removes. DISPOSITION: REMOVE it across the 5 sites — `src/lib/ttl-calculator/calculator.ts` (the `const processingFees = 0` + the result field), `src/types/ttl-types.ts` (drop the field), `src/app/(public)/actions/ttl-calculator.tsx` (drop the optional schema field), `src/components/calculators/Calculator.tsx:146` (drop the copy) — and UPDATE `tests/unit/calculator-store.test.ts:52` (drop the `processingFees: 50` assertion). Removal has ZERO user-visible effect (never rendered) and is research-confirmed clean. Typecheck must stay green (no dangling reference).

### Locked regardless
- Every DELETE must keep `bun run typecheck` + `bun run build` green (no hidden consumer left dangling). Research confirms call sites BEFORE deletion.
- The two KEPT items get a clear comment so they read as intentional.
- No behavior change ships from this phase. No em/en-dash / emoji in any touched user-facing string.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

- `.planning/v6-AUDIT-FINDINGS.md` — findings #5 (CLEAN-01), #6 (CLEAN-02), and the CLEANUP bucket (CLEAN-03 items) with the original verdicts.
- `src/lib/notifications.ts` — the dangling JSDoc at end of file (CLEAN-01).
- `src/lib/help-articles.ts` — `HelpArticle` interface `order_index` + `mapHelpArticle` `order_index: 0` (CLEAN-02); confirm no reader + the `help_articles` schema (`src/lib/schemas/content.ts`) has no such column.
- `src/lib/logger.ts` — the `group`/`groupEnd`/`table` no-op methods (CLEAN-03a); confirm zero callers.
- `src/emails/contact-welcome.tsx` — `PARAGRAPH_STYLE` + its `<Text>` usage (CLEAN-03b, KEEP).
- `src/lib/ttl-calculator/calculator.ts` + `src/types/ttl-types.ts` + `src/app/(public)/actions/ttl-calculator.tsx` + `src/components/calculators/Calculator.tsx` — the `processingFees` chain (CLEAN-03c, KEEP+clarify).
- CLAUDE.md: delete-over-add, no `any`, logger not console, no em/en-dash.
</canonical_refs>

<specifics>
## Specific Ideas
- Win condition: the dangling comment, the phantom `order_index`, and the three unused logger no-op methods are gone; build/types green; the two intentionally-retained items (whiteSpace, processingFees) carry a clear comment so the next audit doesn't re-flag them.
- Gates: `bun run lint && bun run typecheck && bun run test:unit && bun run build`. If any existing test references a deleted symbol (e.g. a logger.table test), update it.
</specifics>

<deferred>
## Deferred Ideas
- The intentional env-gated no-ops (ad-conversions, Sentry, Slack/Discord, Resend, mock DB) are Phase 16 (NOOP-01), not here.
</deferred>

---
*Phase: 15-dead-code-cleanup*
*Context gathered: 2026-06-02, with call-site verification; deletions for CLEAN-01/-02/-03a, keep+document for CLEAN-03b/-03c*
