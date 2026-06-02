---
phase: 11-paystub-tax-accuracy
plan: 02
subsystem: tax-calculation
tags: [paystub, tax-data, state-income-tax, california, new-york, massachusetts, surtax, drizzle-unrelated, typescript]

# Dependency graph
requires:
  - phase: 11-paystub-tax-accuracy (plan 01)
    provides: getSupportedTaxYears() pattern (data-derived year set), 2025 re-key convention for the federal tax-data.ts table
provides:
  - Official 2025 CA FTB Schedule X/Y/Z brackets with the 1% MHS surtax (>$1,000,000) encoded as a top band per schedule (effective 13.3%)
  - Official 2025 NY DTF IT-201-I brackets including the 9.65% / 10.3% / 10.9% high-income brackets for all five filing statuses
  - MA flat 5.0% up to $1,083,150 with the 4% surtax (>$1,083,150) encoded as a second band (effective 9.0%) for all five filing statuses
  - stateTaxDataByYear re-keyed 2025; redundant TX/FL/WA flat-0 rows removed; IL 0.0495 and PA 0.0307 unchanged
  - Exported getSupportedIncomeTaxStateCodes() deriving the selectable income-tax state set (CA, NY, IL, PA, MA) from the table keys
affects: [11-03 (state-tax tests + dropdown derivation), 11-04 (URL-state intersect with supported codes)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Surtax-as-top-bracket: a surtax (base + surtax rate) over a statutory threshold is expressed as an additional ascending {limit, rate} band so calculateStateTax needs no new math path"
    - "Data-derived selectable set: getSupportedIncomeTaxStateCodes() unions Object.keys over every year table into a Set (single source of truth for the dropdown), mirroring 11-01's getSupportedTaxYears()"

key-files:
  created: []
  modified:
    - src/lib/paystub-calculator/state-tax-data.ts

key-decisions:
  - "Encoded CA MHS (1%) and MA (4%) surtaxes as additional top brackets at base+surtax rate rather than adding a new calc path (CONTEXT.md:51, 68 preference; calculateStateTax untouched)"
  - "Added a local massachusettsBrackets() two-band builder instead of reusing flatBrackets (which emits a single Infinity band only) so MA can carry the 1083150 surtax boundary for all five filing statuses"
  - "Inserted a 1000000 limit boundary inside each CA schedule's surtax-containing band per the per-schedule encoding rule, keeping every array strictly ascending"

patterns-established:
  - "Surtax-as-top-bracket encoding (no math change)"
  - "Data-derived getSupportedIncomeTaxStateCodes() over Object.values(stateTaxDataByYear)"

requirements-completed: [PAYSTUB-04, PAYSTUB-06, PAYSTUB-07, PAYSTUB-08, PAYSTUB-01]

# Metrics
duration: 12min
completed: 2026-06-02
---

# Phase 11 Plan 02: State tax-data 2025 (CA/NY/MA official + surtaxes) Summary

**Re-keyed `state-tax-data.ts` to official 2025 with full-fidelity CA (FTB Sch X/Y/Z + 1% MHS surtax over $1M to 13.3%), NY (DTF IT-201-I incl. 9.65/10.3/10.9 high brackets), and MA (flat 5.0% + 4% surtax over $1,083,150 to 9.0%) brackets, deleted the redundant TX/FL/WA flat-0 rows, kept IL 0.0495 / PA 0.0307, and exported `getSupportedIncomeTaxStateCodes()` (CA, NY, IL, PA, MA).**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-06-02T15:16:57Z
- **Completed:** 2026-06-02
- **Tasks:** 1 (tdd-flagged; implementation lands here, tests owned by 11-03)
- **Files modified:** 1

## Accomplishments

- California 2025 (FTB Schedules X/Y/Z) for all five filing statuses, with the 1% Mental Health Services surtax over $1,000,000 inserted as a top band (effective 13.3%) per schedule, every array strictly ascending.
- New York 2025 (DTF IT-201-I) for all five filing statuses, including the 9.65% (to 5,000,000), 10.3% (to 25,000,000) and 10.9% (over) high-income brackets; MFJ/QSS use the official 2025 5.25% ceiling 27,900 and 5.5% ceiling 161,550.
- Massachusetts 2025 as a two-band structure (5.0% up to 1,083,150, then 9.0% over) for all five filing statuses, via a local `massachusettsBrackets()` builder (not `flatBrackets`).
- `stateTaxDataByYear` re-keyed 2025; the three redundant `flatBrackets(0)` rows (TX/FL/WA) removed; IL `flatBrackets(0.0495)` and PA `flatBrackets(0.0307)` untouched.
- Exported `getSupportedIncomeTaxStateCodes()` deriving the selectable income-tax state set from `Object.values(stateTaxDataByYear)` keys (runtime-verified to return exactly CA, NY, IL, PA, MA), so 11-03 can tie the dropdown to the data with no parallel allow-list.

## Task Commits

Each task was committed atomically:

1. **Task 1: Re-key state table to 2025; CA/NY official + surtaxes; MA flat 0.05 + surtax; delete TX/FL/WA; keep IL/PA; export helper** - `5ee659b` (feat)

**Plan metadata:** committed with this SUMMARY (docs).

_Note: This plan's task carried `tdd="true"`, but the test files are owned by 11-03 (Wave-1 boundary). The implementation commit is the GREEN-equivalent for the data; no test commit is created here by design._

## Files Created/Modified

- `src/lib/paystub-calculator/state-tax-data.ts` - 2025-keyed `stateTaxDataByYear` with official CA/NY/MA brackets and surtax top-bands, TX/FL/WA removed, IL/PA unchanged; new `massachusettsBrackets()` builder; new exported `getSupportedIncomeTaxStateCodes()`.

## Exact 2025 arrays written

**CA Schedule X (single + marriedSeparate)** ascending `{limit, rate}` (limits): 11079@1%, 26264@2%, 41452@4%, 57542@6%, 72724@8%, 371479@9.3%, 445771@10.3%, 742953@11.3%, 1000000@12.3%, Infinity@13.3%.
- MHS surtax tail: `{742953, 0.113}, {1000000, 0.123}, {Infinity, 0.133}` (1,000,000 splits the 12.3% band).

**CA Schedule Y (marriedJoint + qualifyingSurvivingSpouse)**: 22158@1%, 52528@2%, 82904@4%, 115084@6%, 145448@8%, 742958@9.3%, 891542@10.3%, 1000000@11.3%, 1485906@12.3%, Infinity@13.3%.
- MHS surtax tail: `{891542, 0.103}, {1000000, 0.113}, {1485906, 0.123}, {Infinity, 0.133}` (1,000,000 splits the 11.3% band).

**CA Schedule Z (headOfHousehold)**: 22173@1%, 52530@2%, 67716@4%, 83805@6%, 98990@8%, 505208@9.3%, 606251@10.3%, 1000000@11.3%, 1010417@12.3%, Infinity@13.3%.
- MHS surtax tail: `{606251, 0.103}, {1000000, 0.113}, {1010417, 0.123}, {Infinity, 0.133}` (1,000,000 splits the 11.3% band).

**NY single + marriedSeparate**: 8500@4%, 11700@4.5%, 13900@5.25%, 80650@5.5%, 215400@6%, 1077550@6.85%, 5000000@9.65%, 25000000@10.3%, Infinity@10.9%.

**NY marriedJoint + qualifyingSurvivingSpouse**: 17150@4%, 23600@4.5%, 27900@5.25%, 161550@5.5%, 323200@6%, 2155350@6.85%, 5000000@9.65%, 25000000@10.3%, Infinity@10.9%.

**NY headOfHousehold**: 12800@4%, 17650@4.5%, 20900@5.25%, 107650@5.5%, 269300@6%, 1616450@6.85%, 5000000@9.65%, 25000000@10.3%, Infinity@10.9%.

**MA (all five filing statuses)**: `{1083150, 0.05}, {Infinity, 0.09}` (flat 5.0% then 5% + 4% surtax = 9.0% over 1,083,150).

**IL**: `flatBrackets(0.0495)` (unchanged). **PA**: `flatBrackets(0.0307)` (unchanged). **TX/FL/WA**: deleted.

## New export

```ts
export function getSupportedIncomeTaxStateCodes(): string[]
```
Unions `Object.keys` over every `Object.values(stateTaxDataByYear)` year table into a `Set<string>` and returns the spread array. Runtime-verified to return `["CA","NY","IL","PA","MA"]`. 11-03 references this to derive the dropdown.

## Decisions Made

- Surtaxes encoded as additional top brackets (CA `base+0.01` over 1,000,000; MA `0.05+0.04=0.09` over 1,083,150) so `calculateStateTax` needs no new math path. Verified the bracket loop applies each rate to the slice between the previous limit and the bracket limit (state-tax-calculations.ts:25-60).
- Used a local `massachusettsBrackets()` two-band builder rather than `flatBrackets` (which can only emit a single Infinity band) so MA carries the surtax boundary across all five statuses.

## Deviations from Plan

None - plan executed exactly as written. The 2025 re-key, official CA/NY/MA values, surtax top-bands, TX/FL/WA removal, IL/PA preservation, and the `getSupportedIncomeTaxStateCodes()` export all match the LOCKED decisions and the transcribed `<official_2025_values>`.

## Issues Encountered

None. All 15 grep acceptance gates pass, `bun run typecheck` is green, and a runtime probe confirmed the helper returns exactly CA/NY/IL/PA/MA, every CA schedule is strictly ascending with a 13.3% top band, MA is the two-band 0.05/0.09 structure, and NY carries the 9.65/10.3/10.9 brackets for all statuses.

## Known Stubs

None. No placeholder data, empty arrays flowing to UI, or TODO/FIXME markers were introduced.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `getSupportedIncomeTaxStateCodes()` is exported and ready for 11-03 to wire the state dropdown to the data and for 11-04 to intersect URL-restored `?state=` codes.
- The state-tax golden/parity/surtax unit tests are owned by 11-03. Existing MA assertions at the old 0.0535 rate are expected RED until 11-03 recomputes them to 0.05 - this is the designed Wave-1 boundary state, not a regression. Test files were not touched here.
- `tax-data.ts`, `states-utils.ts`, and `validation.ts` were not touched (owned by other plans).

## Self-Check: PASSED

- FOUND: src/lib/paystub-calculator/state-tax-data.ts
- FOUND: commit 5ee659b (feat(11-02): official 2025 CA/NY/MA state brackets + surtaxes)
- All 15 grep gates OK; typecheck green; runtime helper/ascending/surtax checks OK.

---
*Phase: 11-paystub-tax-accuracy*
*Completed: 2026-06-02*
