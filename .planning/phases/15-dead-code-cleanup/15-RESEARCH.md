# Phase 15: dead-code-cleanup - Research

**Researched:** 2026-06-02
**Domain:** Safe code deletion (TypeScript strict; Next.js 16 / React 19 / Bun)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **CLEAN-01 (DELETE):** `src/lib/notifications.ts` ends with a dangling `/** Test notification endpoints */` JSDoc block and NO function under it. DELETE the dangling block. Do NOT implement a phantom `sendTestNotification`.
- **CLEAN-02 (DELETE):** `src/lib/help-articles.ts`: `order_index: number` (interface, line 23) and `order_index: 0` (mapper, line 88). The `help_articles` table has NO such column; all queries order by `createdAt`. DELETE both. Research must confirm NO consumer reads `order_index`.
- **CLEAN-03a (DELETE):** `src/lib/logger.ts`: the explicit no-op `group()`, `groupEnd()`, `table()` methods. DELETE if zero callers (else KEEP + document).
- **CLEAN-03b (KEEP + justify):** `src/emails/contact-welcome.tsx`: `whiteSpace: 'pre-wrap'` IS applied via `PARAGRAPH_STYLE` on the `<Text>`. KEEP. Tighten the existing comment to read as intentional defensive styling.
- **CLEAN-03c (KEEP + clarify):** `src/lib/ttl-calculator/calculator.ts`: `const processingFees = 0`, returned in the result. Default KEEP + clarify comment that it is intentionally `0` (included in registration). Claude's discretion: if research shows the field is genuinely unused/undisplayed, removal across the 4 files is acceptable.
- Every DELETE must keep `bun run typecheck` + `bun run build` green. No behavior change ships. No em/en-dash / emoji in any touched user-facing string.

### Claude's Discretion
- CLEAN-03c removal-vs-keep, IF research shows the field is genuinely unused/undisplayed.

### Deferred Ideas (OUT OF SCOPE)
- The intentional env-gated no-ops (ad-conversions, Sentry, Slack/Discord, Resend, mock DB) are Phase 16 / NOOP-01, not here.
- Any behavior change. Anything beyond CLEAN-01..03.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CLEAN-01 | Remove dangling "Test notification endpoints" JSDoc stub in `notifications.ts`. | Verified: comment is the literal last line (389-391), no function, zero references repo-wide. SAFE to delete. |
| CLEAN-02 | Remove phantom `HelpArticle.order_index` (interface + mapper), no backing column. | Verified: schema `help_articles` has no such column; only 2 occurrences, both inside `help-articles.ts`; zero readers. SAFE to delete. |
| CLEAN-03 | Resolve logger `group`/`groupEnd`/`table` (delete if no callers, else document); `contact-welcome` `whiteSpace` (remove or justify); ttl `processingFees` (verify, remove or comment). | logger: zero callers, DELETE methods AND the 3 interface members in `src/types/logger.ts`. whiteSpace: KEEP + comment. processingFees: NOT displayed; KEEP+clarify is the locked default and is safe, but removal is also clean (5 sites incl. 1 test). |
</phase_requirements>

## Summary

This is a pure-subtraction cleanup phase. Three DELETEs and two KEEP+comment items. I grepped the entire repo (`src/`, `tests/`, `e2e/`) for every consumer of each to-be-deleted symbol and verified the current `bun run typecheck` baseline is green (exit 0, no output).

**All three DELETEs are SAFE.** The only non-obvious risk is CLEAN-03a: the no-op `group`/`groupEnd`/`table` methods are also declared on the `Logger` interface in `src/types/logger.ts` (lines 72-76), and `class BaseLogger implements Logger`. Deleting the method bodies from `logger.ts` WITHOUT also removing the three interface members will produce a TS2420 "class incorrectly implements interface" error. The fix is trivial (remove all six lines, three in each file) but the plan MUST touch both files or the build breaks.

**Primary recommendation:** Delete CLEAN-01 (3 lines), CLEAN-02 (2 lines), and CLEAN-03a (method bodies in `logger.ts` + the 3 interface members in `src/types/logger.ts`). KEEP CLEAN-03b and CLEAN-03c with tightened comments, exactly as locked. One existing test must be checked for CLEAN-03c only if the discretion-removal path is taken (`tests/unit/calculator-store.test.ts:52`); under the default KEEP path, no test changes are required.

## Standard Stack

No new dependencies. No package installs. This phase only removes code and edits comments.

## Package Legitimacy Audit

Not applicable — this phase installs no external packages.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Notifications stub comment (CLEAN-01) | API / Backend (`src/lib/notifications.ts`) | — | Server-only notification helpers; dangling doc comment, no tier impact |
| Help article shape (CLEAN-02) | API / Backend (`src/lib/help-articles.ts`) | — | Server data-mapping layer; field never crosses to a render tier |
| Logger no-op methods (CLEAN-03a) | Cross-cutting (`src/lib/logger.ts` + `src/types/logger.ts`) | Browser + Backend | Logger is isomorphic; interface contract shared by all tiers |
| Email paragraph style (CLEAN-03b) | Email render (`src/emails/contact-welcome.tsx`) | — | React Email template styling; KEEP |
| TTL processing fee (CLEAN-03c) | Domain calc (`src/lib/ttl-calculator/calculator.ts`) -> Browser (`Calculator.tsx`) | — | Pure calc result; copied into comparison object but never rendered |

## Per-Item Safety Verdicts

### CLEAN-01 — dangling "Test notification endpoints" comment -> **SAFE TO DELETE**

`src/lib/notifications.ts` lines 388-391:
```
/**
 * Test notification endpoints
 */
```
This is the literal end of the file (line 391 is the last line; there is no function, export, or symbol beneath it).

**Consumer count: 0.**
- `grep -rn "Test notification" src tests e2e` -> 1 hit, the comment itself (`notifications.ts:389`).
- `grep -rn "sendTestNotification" src tests e2e` -> 0 hits.

**Action:** Delete lines 388-391 (the comment block + the trailing blank line preceding it if Biome wants a clean EOF). No `implements`/export contract touches it. Build-safe.
**Verdict: SAFE. [VERIFIED: repo grep src+tests+e2e]**

### CLEAN-02 — `HelpArticle.order_index` -> **SAFE TO DELETE**

`src/lib/help-articles.ts`:
- Line 23: `order_index: number` (in the exported `HelpArticle` interface)
- Line 88: `order_index: 0` (in `mapHelpArticle`)

**Schema confirmation:** `src/lib/schemas/content.ts` lines 54-64 — the `help_articles` `pgTable` columns are `id, slug, title, content, excerpt, category, published, createdAt, updatedAt`. **No `order_index` / `orderIndex` column exists.** The Drizzle `$inferSelect` type (`HelpArticleRow`) therefore does not have it; the field is fabricated only on the lib-level `HelpArticle` interface and hardcoded `0` in the mapper.

**Consumer count: 0 readers.**
- `grep -rn "order_index|orderIndex" src tests e2e` -> exactly 2 hits, both the declaration + the mapper assignment above. Nothing reads it.
- `grep -rn "HelpArticle" src tests e2e` -> all hits are internal to `help-articles.ts` (interface decl, mapper return type, function return types) plus the unrelated Drizzle `HelpArticle` type export in `content.ts`. The four render/consumer sites (`src/app/sitemap.ts`, `src/app/(public)/help/page.tsx`, `.../[category]/page.tsx`, `.../[category]/[slug]/page.tsx`) consume `slug`, `title`, `category`, `content`, `excerpt`, `created_at` — none reads `order_index`, none sorts by it (queries sort by `category` + `createdAt`, lines 108/141).
- `grep` of `tests/unit/sitemap.test.ts` (the only help-article-adjacent test) -> no `order_index` / `HelpArticle` reference.

**Action:** Delete line 23 (interface) and line 88 (mapper). No test constructs a `HelpArticle` literal that would break.
**Verdict: SAFE. [VERIFIED: repo grep src+tests+e2e + schema read]**

### CLEAN-03a — logger `group` / `groupEnd` / `table` no-op methods -> **SAFE TO DELETE (two files)**

`src/lib/logger.ts` lines 321-333 — three no-op method bodies on `class BaseLogger`:
```ts
group(_label: string): void { /* No-op */ }
groupEnd(): void { /* No-op */ }
table(_data: unknown): void { /* No-op */ }
```

**Caller count: 0.**
- `grep -rn "\.group(|\.groupEnd(|\.table(|logger\.group|logger\.groupEnd|logger\.table" src tests e2e` -> 0 hits against the logger. (The broader sweep returned only unrelated word-matches: `group-hover:` Tailwind classes, `toHaveProperty('href')`, cmdk command "group" entries, route-group comments, `groupBy` in a blog-utils test array. None call the logger methods.)
- All 40+ logger import sites (`from '@/lib/logger'`, `createServerLogger`) were enumerated; none invoke `group`/`groupEnd`/`table`.
- No logger unit test exists that asserts these methods (`tests/unit/` has `log-redact.test.ts` and `blog.test.ts`; neither references the logger's `group`/`table`).

**CRITICAL — must also edit the interface:** `src/types/logger.ts` lines 71-76 declare these on the `Logger` interface:
```ts
// Grouping (for development)
group(label: string): void
groupEnd(): void
// Table display (for development)
table(data: unknown): void
```
`class BaseLogger implements Logger` (logger.ts:139) and `interface ServerLogger extends Logger` (logger.ts/types). If the plan deletes the method bodies from `BaseLogger` but leaves the interface members, TypeScript emits **TS2420: Class 'BaseLogger' incorrectly implements interface 'Logger'**, breaking `bun run typecheck` and `bun run build`. Conversely, removing the interface members while leaving the bodies is harmless but leaves dead code.

**Action:** Delete BOTH:
1. `src/lib/logger.ts` lines 321-333 (the three method bodies + their leading blank line).
2. `src/types/logger.ts` lines 71-76 (the two comment lines + three signature lines for `group`, `groupEnd`, `table`).
**Verdict: SAFE, but is a TWO-FILE edit. Single-file deletion WILL break the build. [VERIFIED: repo grep src+tests+e2e + interface read]**

### CLEAN-03b — `contact-welcome` `PARAGRAPH_STYLE.whiteSpace` -> **KEEP, characterization CONFIRMED**

`src/emails/contact-welcome.tsx`:
- `PARAGRAPH_STYLE` (lines 25-31) sets `whiteSpace: 'pre-wrap' as const`.
- It IS applied: line 47 `<Text key={...} style={PARAGRAPH_STYLE}>{paragraph}</Text>`. Confirmed used, not orphaned.
- Currently inert: line 39-42 splits content on `\n\n` and `.trim()`s each paragraph, so a paragraph passed to `<Text>` only contains an intra-paragraph soft `\n` if the source template embeds one. The component doc (lines 8-15) confirms templates separate paragraphs with `\n\n`; a single `\n` "stays as a soft line break." So `pre-wrap` is defensive — it only matters the day a template adds an intra-paragraph `\n`.
- The existing comment (lines 19-24) **already** explains this clearly, including the Outlook-normalization caveat. It is already well-documented as inert-but-defensive.

**Recommendation:** KEEP as locked. The comment is already accurate. A light tightening (one phrase like "currently inert; intentional defensive styling, do not remove") is optional polish, not required. Do NOT remove `whiteSpace` — removing it would silently drop soft-line-break rendering the moment a future template needs it.
**Verdict: KEEP confirmed. [VERIFIED: file read]**

### CLEAN-03c — ttl-calculator `processingFees` always-0 -> **KEEP+clarify is SAFE; but correct one CONTEXT claim**

`src/lib/ttl-calculator/calculator.ts`:
- Line 99: `const processingFees = 0` with comment `// Processing fees (already included in registration calculation)`.
- Line 114: returned in the `TTLResults` object.
- The "already included" claim is **accurate**: `PROCESSING_FEE = 4.75` (line 40) is summed into `calculateRegistrationFee` (line 68), which feeds `registrationFees`. So the standalone `processingFees` line is genuinely a real-but-zero breakdown member, not a bug.

**Consumer chain (verified):**
- `src/types/ttl-types.ts:6` — `processingFees: number` (required field on `TTLResults`).
- `src/app/(public)/actions/ttl-calculator.tsx:40` — `processingFees: z.number().optional()` in the save-calculation Zod schema (optional, so its presence/absence does not gate parsing).
- `src/components/calculators/Calculator.tsx:146` — copied into the comparison-vehicle `ttl` object: `processingFees: calculationResults?.ttlResults?.processingFees ?? 0`.
- `tests/unit/calculator-store.test.ts:52` — a `TTLResults` literal with `processingFees: 50` asserted via `toEqual`.

**Correction to the CONTEXT characterization:** CONTEXT says it "is an accurate, displayed `$0` line item in the Tax/Title/License breakdown." That is **not accurate** — `processingFees` is NEVER rendered:
- `ResultsPanel.tsx` renders salesTax, titleFee, registrationFees, evFee (conditional), emissions (conditional), totalTTL — **no `processingFees` row**.
- `ComparisonView.tsx` renders salesTax, titleFee, registrationFees, totalTTL — **no `processingFees` row**.
- `Calculator.tsx:146` only copies the value into an object whose own view (`ComparisonView`) never shows it.

So the field is part of the typed result contract and is read once into a comparison object, but it is **never displayed to a user**. This makes both dispositions safe:

- **KEEP+clarify (locked default):** Fully safe, zero risk, satisfies CLEAN-03's "else documented." Recommended unless the operator wants the trim. Tighten the line-99 comment to e.g. `// Always 0: processing fee is already folded into registrationFees (PROCESSING_FEE in calculateRegistrationFee). Kept as an explicit breakdown member for contract/UI stability.`
- **Removal (discretion path):** Also clean. It touches 5 sites: `ttl-types.ts:6` (remove field), `calculator.ts:99` + `:114` (remove const + return member), `Calculator.tsx:146` (remove copy line), and `calculator-store.test.ts:52` (remove from the test literal — **this test MUST be updated or its `toEqual` breaks**). The action-schema line `ttl-calculator.tsx:40` is `.optional()`, so it can be removed or left as a harmless tolerant field. Removal changes the `TTLResults` contract for no functional gain since the field is undisplayed.

**Recommendation:** Honor the lock — **KEEP + clarify comment.** It is the lower-risk path and the field, while undisplayed, is a stable part of the result contract. If the operator prefers strict YAGNI subtraction, removal is acceptable and clean, but then the plan MUST include the `calculator-store.test.ts:52` edit.
**Verdict: KEEP+clarify recommended (safe). Removal also safe IF the one test is updated. The CONTEXT "displayed" claim is corrected to "read-but-never-rendered." [VERIFIED: repo grep + render-component reads]**

## Tests That Must Be Updated

| Test | Symbol | Required under DEFAULT (locked) plan? | Required under discretion-removal of CLEAN-03c? |
|------|--------|----------------------------------------|--------------------------------------------------|
| `tests/unit/calculator-store.test.ts:52` (`processingFees: 50` in a `TTLResults` literal, asserted via `toEqual`) | `processingFees` | NO — field kept, test unchanged | YES — remove the field or the `toEqual` fails |

No test references CLEAN-01, CLEAN-02, or CLEAN-03a symbols. No logger test asserts `group`/`groupEnd`/`table`. **Under the locked plan (KEEP processingFees), zero test changes are required.**

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Confirming "no callers" before deletion | Manual eyeballing | `grep -rn` across `src tests e2e` + `bun run typecheck` | The compiler is the ground truth for TS interface contracts; grep catches string/comment refs |
| Removing an interface method | Delete only the implementation | Delete impl AND the interface member together | `implements` contract; partial deletion = TS2420 build break (the CLEAN-03a trap) |

**Key insight:** The single real hazard in this phase is the logger interface/implementation coupling. Everything else is isolated dead code.

## Common Pitfalls

### Pitfall 1: Deleting logger method bodies without the interface members
**What goes wrong:** `BaseLogger implements Logger` fails with TS2420; `bun run typecheck` and `bun run build` go red.
**Why it happens:** The no-op methods are declared in two files — `src/lib/logger.ts` (bodies) and `src/types/logger.ts` (signatures on the `Logger` interface, inherited by `ServerLogger`).
**How to avoid:** Edit both files in the same task. Remove logger.ts:321-333 AND logger.ts/types lines 71-76.
**Warning signs:** Typecheck error mentioning "incorrectly implements interface 'Logger'".

### Pitfall 2: Assuming `processingFees` is displayed (per CONTEXT) and over-protecting it
**What goes wrong:** Planning around a "displayed $0 line item" that does not exist could lead to wrong verification steps (e.g., an e2e check for a non-existent row).
**Why it happens:** The CONTEXT note states it is displayed; the render components prove it is not.
**How to avoid:** Verification for CLEAN-03c is comment-only (KEEP path) or a grep + test-edit + typecheck (removal path). Do NOT add a UI assertion for `processingFees`.
**Warning signs:** Any plan task that greps the DOM/JSX for a processing-fee label.

### Pitfall 3: Leaving a malformed end-of-file after CLEAN-01
**What goes wrong:** Biome may flag trailing whitespace / missing final newline after removing the last comment block.
**How to avoid:** Run `bun run lint` (or `lint:fix`) after the deletion; ensure the file ends with the `}` of `notifyNewLead` + a single trailing newline.

## Runtime State Inventory

This is a code-only cleanup with no rename of any stored key, env var, OS registration, or build artifact. Each category checked explicitly:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — `order_index` was never a DB column (verified: `help_articles` schema has no such field); no datastore stores any of these symbols. | None |
| Live service config | None — no external service references `processingFees`, `order_index`, or the logger no-ops. | None |
| OS-registered state | None — no task/cron/process name involves these symbols. | None |
| Secrets/env vars | None — no env var keys reference any deleted symbol. | None |
| Build artifacts | None — no compiled package or egg-info carries these names; deletions are source-only and rebuild cleanly. | None |

## Code Examples

### CLEAN-03a — the two-file edit (the only non-trivial deletion)
```ts
// src/lib/logger.ts — DELETE lines 321-333 (these method bodies):
//   group(_label: string): void { /* No-op */ }
//   groupEnd(): void { /* No-op */ }
//   table(_data: unknown): void { /* No-op */ }

// src/types/logger.ts — DELETE lines 71-76 (interface members + comments):
//   // Grouping (for development)
//   group(label: string): void
//   groupEnd(): void
//   // Table display (for development)
//   table(data: unknown): void
// Both edits in one task -> typecheck stays green.
```

## State of the Art

Not applicable — this phase introduces no new technology or pattern. It applies the project's own CLAUDE.md principle "Delete code rather than add when possible."

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| — | (none) | — | All claims verified by repo grep (src+tests+e2e), file reads, and a green `bun run typecheck` baseline. No assumed claims. |

**This table is empty by design:** every safety verdict is backed by a tool-verified grep count and the relevant source read.

## Open Questions

1. **CLEAN-03c: KEEP vs. remove**
   - What we know: The field is in the type contract, validated as optional in the action, copied once in `Calculator.tsx`, asserted in one unit test, and consumed nowhere on screen.
   - What's unclear: Operator preference between strict YAGNI subtraction and contract stability.
   - Recommendation: Honor the lock — KEEP + clarify comment (lower risk, no test churn). Surface removal as an available, clean alternative that costs one extra test edit.

## Validation Architecture

> Honest note: deletions have almost no unit-test surface. The verification for this phase is overwhelmingly static (grep + typecheck + build + lint) plus a no-behavior-change assertion. Only CLEAN-03c, and only on the discretion-removal path, touches an existing test.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `bun:test` (unit) + Playwright (e2e) |
| Config file | `tests/setup.ts` (auto-mocks `@/env`, `@/lib/logger`); Playwright config at repo root |
| Quick run command | `bun run test:unit` (alias `bun test tests/`) |
| Full suite command | `bun run test:all` (lint + typecheck + unit + e2e:fast) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CLEAN-01 | Dangling comment removed; file still compiles | static | `bun run typecheck` | n/a (no behavior) |
| CLEAN-02 | `order_index` removed; help-article flows unaffected | static | `bun run typecheck` (+ existing `tests/unit/sitemap.test.ts`) | Yes (sitemap.test.ts, unrelated to field) |
| CLEAN-03a | logger no-ops removed from impl + interface; class still implements `Logger` | static | `bun run typecheck` | n/a (no logger test asserts these) |
| CLEAN-03b | `whiteSpace` retained; comment tightened | static | `bun run typecheck` + `bun run lint` | n/a (KEEP) |
| CLEAN-03c (KEEP path) | comment clarified; no contract change | static | `bun run typecheck` + `bun test tests/unit/calculator-store.test.ts` (unchanged, must still pass) | Yes (calculator-store.test.ts) |
| CLEAN-03c (removal path) | field removed from contract + test | unit | `bun test tests/unit/calculator-store.test.ts` after editing line 52 | Yes (must edit) |

### Sampling Rate
- **Per task commit:** `bun run lint && bun run typecheck`
- **Per wave merge:** `bun run test:unit`
- **Phase gate:** `bun run lint && bun run typecheck && bun run test:unit && bun run build` all green (CONTEXT "Gates").

### Wave 0 Gaps
- None — existing test infrastructure covers all phase requirements. No new test file or fixture is needed. (`bun:test` + Playwright already configured; deletions are verified by typecheck/build, not new assertions.)

## Environment Availability

> Probed the tools this phase needs. All present.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Bun | typecheck / lint / test runner | yes (per project) | 1.3.x | — |
| `tsc` (via `bun run typecheck`) | build-safety gate for all 3 DELETEs | yes | green baseline confirmed (exit 0) | — |
| Biome | lint gate | yes | 2.4.4 | — |
| `grep` | consumer verification | yes (system) | — | ripgrep if preferred |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None. Note: GNU `timeout` is NOT available on this macOS shell — do not use it in plan task commands; rely on the Bash tool's own timeout instead.

## Project Constraints (from CLAUDE.md)

- **Delete code rather than add** — directly supports this phase's subtraction intent.
- **No `any` types** — all edits preserve existing typed signatures; do not introduce `any` when trimming the `Logger` interface.
- **Logger, never `console.*`** — relevant context: the no-op methods being deleted exist precisely because `console.group/table` are disallowed; deleting them removes dead surface, it does not re-enable console use.
- **No em/en-dash, no emoji** in any user-facing string — the only comment edits (CLEAN-03b/-03c) are developer-only code comments (exempt), but keep them dash-free anyway for consistency.
- **Before commit:** `bun run lint && bun run typecheck` must pass; Lefthook pre-commit must pass.
- **Search first / follow existing patterns** — honored; verdicts are grounded in the actual codebase, not assumptions.

## Sources

### Primary (HIGH confidence)
- Repo file reads: `src/lib/notifications.ts`, `src/lib/help-articles.ts`, `src/lib/logger.ts`, `src/types/logger.ts`, `src/emails/contact-welcome.tsx`, `src/lib/ttl-calculator/calculator.ts`, `src/types/ttl-types.ts`, `src/app/(public)/actions/ttl-calculator.tsx`, `src/components/calculators/Calculator.tsx`, `src/components/calculators/ResultsPanel.tsx`, `src/components/calculators/ComparisonView.tsx`, `src/lib/schemas/content.ts`, `tests/unit/calculator-store.test.ts`.
- Repo-wide greps over `src tests e2e` for: `Test notification`, `sendTestNotification`, `order_index`/`orderIndex`, `HelpArticle`, `logger.group`/`.group(`/`.groupEnd(`/`.table(`, `processingFees`/`PROCESSING_FEE`.
- `bun run typecheck` — green baseline (exit 0, no diagnostics), confirming deletions start from a clean tree.
- `.planning/phases/15-dead-code-cleanup/15-CONTEXT.md`, `.planning/v6-AUDIT-FINDINGS.md`, `.planning/REQUIREMENTS.md`.

### Secondary (MEDIUM confidence)
- None needed.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- CLEAN-01 safety: HIGH — single comment, zero refs, EOF-located.
- CLEAN-02 safety: HIGH — schema confirms no column; only 2 in-file occurrences, zero readers.
- CLEAN-03a safety: HIGH — zero callers; the interface-coupling trap is identified and the two-file fix is specified.
- CLEAN-03b characterization: HIGH — `PARAGRAPH_STYLE` is applied; comment already accurate.
- CLEAN-03c characterization: HIGH — full consumer chain mapped; corrected the "displayed" claim (it is read but never rendered); both dispositions proven safe.

**Research date:** 2026-06-02
**Valid until:** 2026-07-02 (stable; revalidate the greps if any of the 6 touched files change before execution)
