---
phase: 59-tool-page-polish
plan: 05
subsystem: ui
tags: [react-pdf, pdf-download, tool-page-layout, programmatic-download]

requires:
  - phase: 59-tool-page-polish
    provides: ToolPageLayout with actions prop and ResultCard action bar

provides:
  - Contract generator wired to ToolPageLayout actions prop with programmatic pdf().toBlob() download
  - Invoice generator wired to ToolPageLayout actions prop with programmatic pdf().toBlob() download
  - Proposal generator wired to ToolPageLayout actions prop with programmatic pdf().toBlob() download
  - hasResult prop wired to isHydrated && isValid on all three PDF generator tools
  - resultSlot showing document summary (template/invoice#/project, provider/client, total) when ready

affects: [tool-page-polish, pdf-generators, ToolPageLayout]

tech-stack:
  added: []
  patterns:
    - "Programmatic pdf().toBlob() + URL.createObjectURL for PDF download (avoids PDFDownloadLink ReactNode constraint)"
    - "Dynamic import of pdf() inside async onClick handler for SSR compatibility"
    - "resultSlot with document summary enables ToolPageLayout action bar for single-column document builders"

key-files:
  created: []
  modified:
    - src/app/tools/contract-generator/ContractGeneratorClient.tsx
    - src/app/tools/invoice-generator/InvoiceGeneratorClient.tsx
    - src/app/tools/proposal-generator/ProposalGeneratorClient.tsx

key-decisions:
  - "Replaced PDFDownloadLink (ReactNode, cannot have plain onClick) with programmatic pdf().toBlob() approach"
  - "Added resultSlot with document summary to enable ToolPageLayout action bar for single-column tools"
  - "PDFDownloadLink dynamic import removed entirely from all three generators"
  - "getFileName converted to useCallback for stable reference in handleDownload dependency array"

patterns-established:
  - "PDF download pattern: const { pdf } = await import('@react-pdf/renderer') inside useCallback async handler"
  - "Single-column document builders need both resultSlot + hasResult for ToolPageLayout action bar to appear"

requirements-completed: [TOOL-03]

duration: 25min
completed: 2026-03-01
---

# Phase 59 Plan 05: PDF Generator Action Bar Summary

**Programmatic pdf().toBlob() download on contract/invoice/proposal generators wired to ToolPageLayout actions prop, replacing PDFDownloadLink with a design-system-consistent action bar**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-03-01T20:30:00Z
- **Completed:** 2026-03-01T20:55:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- All three PDF generator tools (contract, invoice, proposal) now use programmatic `pdf().toBlob()` download instead of `PDFDownloadLink`
- `handleDownload` added as `useCallback` with dynamic import of `pdf` from `@react-pdf/renderer` inside the async handler
- `resultSlot` added to each tool showing document summary (template/invoice number/project, provider/client, total amount)
- `hasResult={isHydrated && isValid}` wired on all three tools so ToolPageLayout knows when document is ready
- `actions=[{type:'download', label:'Download PDF', onClick:handleDownload}]` wired — action bar now appears in ResultCard
- PDFDownloadLink removed from formSlot actions section and dynamic import removed on all three files

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire contract generator** - `527bf11` (feat)
2. **Task 2: Wire invoice and proposal generators** - `448a1b6` (feat)

**Plan metadata:** (see final commit below)

## Files Created/Modified

- `src/app/tools/contract-generator/ContractGeneratorClient.tsx` - Added handleDownload, resultSlot, hasResult, actions; removed PDFDownloadLink
- `src/app/tools/invoice-generator/InvoiceGeneratorClient.tsx` - Added handleDownload, resultSlot, hasResult, actions; removed PDFDownloadLink
- `src/app/tools/proposal-generator/ProposalGeneratorClient.tsx` - Added handleDownload, resultSlot, hasResult, actions; removed PDFDownloadLink

## Decisions Made

- Used programmatic `pdf().toBlob()` approach instead of `PDFDownloadLink` because `PDFDownloadLink` renders as a ReactNode that cannot be converted to a plain `onClick: () => void` function required by `ToolAction` interface
- Dynamic import of `pdf()` occurs inside the `useCallback` handler (not at module level) because the document components are themselves dynamic imports and cannot be awaited at module scope
- Added `resultSlot` with document summary to satisfy ToolPageLayout single-column condition (`hasResult && resultSlot`) required for ResultCard (and its action bar) to render
- `getFileName` on contract generator converted to `useCallback` (it was a plain function before) to allow stable inclusion in `handleDownload` dependency array

## Deviations from Plan

None - plan executed exactly as specified. The plan's `<interfaces>` section correctly identified the need for both `resultSlot` and `hasResult` to surface the action bar.

## Issues Encountered

- Biome formatter required line-length adjustments on the contract generator file (dependency array and logger.error call formatting). Applied `biome format --write` before commit to pass pre-commit hook.
- File write tool required re-reading between intermediate edits due to linter modifications. Used Python script for reliable multi-step modifications.

## Next Phase Readiness

- All three PDF generators now use consistent ToolPageLayout action bar pattern
- Gap 1 from 59-VERIFICATION.md closed: download button in ToolPageLayout action bar position
- Phase 59 gap closure complete (plans 59-05 and 59-06 address both verification gaps)

---
*Phase: 59-tool-page-polish*
*Completed: 2026-03-01*
