# Phase 17 Research — test-suite-isolation

**Researched:** 2026-06-02
**Method:** Direct reproduction + bisection in this repo, grounded in the upstream bun issue. Root cause is PROVEN, not hypothesized.

## The bug (official source)

bun's `mock.module(specifier, factory)` registers the mock in a **process-global** module registry and is **NOT** undone by `mock.restore()` or `mock.clearAllMocks()`. Upstream: oven-sh/bun#7823 ("mock.module is not scoped / cannot be restored"). There is no per-file mock isolation in `bun test`; every test file shares one module registry for the whole run. Consequence: a test that registers a **partial** mock of a module replaces that module for ALL subsequently-executed test files. A later file that statically imports a name the partial mock omitted gets either `undefined` or a hard `SyntaxError: Export named 'X' not found`.

## Root cause in this repo (PROVEN)

The single poisoner is **`tests/unit/ttl-calculator-actions.test.ts`** via its `setupCommonMocks()` helper (lines 42-111). It partial-mocks five modules, of which three are pure/shared and two are redundant:

| Mocked module | Mock provides | Real surface | Leak |
|---|---|---|---|
| `@/lib/utils` | `formatCurrency` only | `cn`, `formatCurrency`, … | **YES** — drops `cn`; later `import { cn }` → `SyntaxError: Export named 'cn' not found` |
| `@/lib/constants/business` | `BUSINESS_INFO` without `links` | full `BUSINESS_INFO` incl. `links.facebook` | **YES** — later `BUSINESS_INFO.links.facebook` → `undefined is not an object` |
| `@/lib/schemas/ttl` | string-keyed stub | real Drizzle table `ttlCalculations` | risk — any later importer gets the stub |
| `@/env` | `{NODE_ENV, NEXT_PUBLIC_SITE_URL}` | full `TEST_ENV` (incl. `RESEND_API_KEY`) | **YES** — overrides `setup.ts`'s complete mock, dropping keys for later tests |
| `@/lib/logger` | full logger surface | full logger surface | redundant (`setup.ts` already mocks completely) |

### Reproduction (exact)

- Isolated: `bun test tests/unit/homepage.test.tsx tests/unit/navigation.test.tsx` → **35 pass / 0 fail**.
- Poisoned ordering: `bun test tests/unit/ttl-calculator-actions.test.ts tests/unit/homepage.test.tsx tests/unit/navigation.test.tsx` → homepage/navigation/Footer fail with `SyntaxError: Export named 'cn' not found in module '.../src/lib/utils.ts'`.

This is the same class of failure the v6 deferred-items log recorded as "~21 homepage/navigation RTL failures only under full-suite ordering." The dominant symptom under real ordering is the `cn` SyntaxError (the `@/lib/utils` leak); the `BUSINESS_INFO.links` symptom is the secondary `@/lib/constants/business` leak.

## What the action actually needs

`src/app/(public)/actions/ttl-calculator.tsx` imports: `eq,sql` (drizzle-orm), `TtlCalculatorResults` (email), `env`, `BUSINESS_INFO` (used at L295: `${BUSINESS_INFO.name} <${BUSINESS_INFO.email}>`), `db`, `logger`, `getResendClient`, `ttlCalculations` (Drizzle table), `formatCurrency` (L141).

- `@/lib/utils.formatCurrency`, `@/lib/constants/business.BUSINESS_INFO`, `@/lib/schemas/ttl.ttlCalculations` are pure/deterministic → **use the REAL modules**, no mock needed. The real Drizzle table is fine because the `db` mock intercepts execution and `drizzle-orm` stays real (the file's own comment already forbids mocking drizzle-orm for this reason).
- `@/env` + `@/lib/logger` are already mocked **completely** by `tests/setup.ts` (`mock.module('@/env', () => ({ env: TEST_ENV }))` at L28; logger at L125) → **drop the local partial overrides**.
- `@/lib/db` is the real boundary → **keep the mock**.
- `@/lib/resend-client` exports exactly `getResendClient` + `isResendConfigured`; the test's mock provides both → it is a **complete** mock (no leak) → keep it (the action sends an email via `getResendClient`, which would otherwise need a real key).

## Fix direction (for the planner)

1. **TEST-01:** In `ttl-calculator-actions.test.ts`, reduce `setupCommonMocks()` to mock only `@/lib/db` and `@/lib/resend-client`. Remove the `@/env`, `@/lib/logger`, `@/lib/constants/business`, `@/lib/utils`, `@/lib/schemas/ttl` mocks. Confirm the 9 ttl tests still pass in isolation, then confirm the full `bun test tests/` is 0-fail and order-independent (run it, and run a worst-case ordering with ttl first).
2. **TEST-02 (guard):** add a durable guard against the same class of leak. Candidate canonical approaches (planner to choose):
   - a CI/lint grep that flags any new `mock.module('@/lib/utils'|'@/lib/constants/*'|'@/lib/schemas/*'|'@/lib/db'…)` partial mock outside `tests/setup.ts`, OR
   - a lightweight meta-test (sorted to run last, e.g. `zz-…`) asserting the real shared exports (`cn`, `BUSINESS_INFO.links.facebook`, `formatCurrency`) are intact — a canary that fails loudly if a future partial mock leaks, OR
   - a documented convention in `tests/setup.ts` / a TESTING note + the canary.
   The bun limitation means there is no per-file isolation fix; the guard must be detection/convention, not a runtime reset.

## Pitfalls

1. Do NOT "fix" by `.skip`/`xfail`/deleting the homepage/navigation assertions — that hides the symptom and violates the milestone decision.
2. Do NOT mock `drizzle-orm` to avoid importing the real `ttlCalculations` table — the file's existing comment is correct; mocking drizzle partially breaks the suite worse.
3. Watch for other partial-mock leakers surfacing once this one is fixed — after the fix, run the FULL suite and bisect any residual cross-file failure the same way. Re-run repeatedly; bun file ordering is not guaranteed stable.
4. Local full-suite has historically been called unreliable here — but it reproduced the leak deterministically in this session, so it IS usable; still cross-check the CI Test job count.
