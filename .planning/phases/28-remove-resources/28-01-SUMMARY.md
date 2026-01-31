---
phase: 28-remove-resources
plan: 01
subsystem: routing
provides: [cleaner-routes]
affects: [35]
tags: [cleanup, deletion, v3.0-consolidation]
key-decisions: [also-deleted-orphaned-lead-magnet-api]
key-files: []
---

# Phase 28 Plan 01: Remove Resources Pages Summary

**Deleted 2 lead-magnet resource pages and orphaned API route, removing ~800 LOC.**

## Accomplishments

- Deleted conversion-optimization-toolkit page
- Deleted website-performance-checklist page
- Deleted orphaned lead-magnet API route (only used by deleted pages)
- Cleaned up dead `downloadLeadMagnet` method in api-client.ts
- Build and typecheck pass with no errors

## Files Deleted

- `src/app/resources/conversion-optimization-toolkit/page.tsx`
- `src/app/resources/website-performance-checklist/page.tsx`
- `src/app/api/lead-magnet/route.ts`

## Files Modified

- `src/lib/api-client.ts` - removed dead `downloadLeadMagnet` method

**Total: ~800 lines of code removed**

## Decisions Made

- Also deleted `/api/lead-magnet` route since it was only used by the resource pages being deleted

## Issues Encountered

None.

## Next Step

Ready for Phase 29 (Tools Cleanup - remove 8 low-value tools).
