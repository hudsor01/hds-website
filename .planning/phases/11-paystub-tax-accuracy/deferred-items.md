# Deferred Items - Phase 11 (paystub-tax-accuracy)

## Out-of-scope test failures discovered during 11-03 execution (2026-06-02)

While running the full `bun run test:unit` gate for plan 11-03, 21 pre-existing
failures surfaced that are unrelated to the paystub tax work. They are recorded
here per the executor SCOPE BOUNDARY rule (do not fix pre-existing failures in
unrelated files) and were NOT touched by 11-03.

### Evidence they are pre-existing

- Checked out the pre-11-03 tree (`2d3eaf00`, the 11-02 metadata commit) and ran
  the full suite: **21 fail** before any 11-03 change.
- After 11-03 (Tasks 1-3 + the one Rule 1 fixture re-key): still exactly **21 fail**,
  with **953 pass** (up from 946; +7 from the new 11-03 tests). Net new failures
  introduced by 11-03: **0**.
- All 21 failing files PASS in isolation (`bun test tests/unit/homepage.test.tsx
  tests/unit/navigation.test.tsx` -> 35 pass, 0 fail). They only fail under the
  full-suite run, which is classic cross-file test-pollution / ordering, not a
  product defect introduced by 11-03.

### The 21 failures (grouped)

| Suite | Count | File |
|-------|-------|------|
| Footer Component | 9 | `tests/unit/navigation.test.tsx` |
| HomePage structural assertions | 10 | `tests/unit/homepage.test.tsx` |
| Navbar Polish - COMP-04 | 1 | `tests/unit/navigation.test.tsx` |
| Navigation Accessibility | 1 | `tests/unit/navigation.test.tsx` |

These are React Testing Library structural/DOM assertions (class tokens, ARIA
labels, copyright year) that depend on a clean jsdom render. They appear to be
poisoned by global mock/DOM state leaking from an earlier test file in the
full-suite ordering. Out of scope for the paystub data-accuracy phase.

### Recommended follow-up (separate from v6 Phase 11)

- Isolate the polluting test file (binary-search the suite order) and add proper
  per-file DOM/mock cleanup (`afterEach` / `cleanup()` from RTL) so
  `tests/unit/homepage.test.tsx` + `tests/unit/navigation.test.tsx` pass under
  the full `bun run test:unit` run, not just in isolation.
