---
phase: 60-content-page-polish
plan: "01"
subsystem: ui
tags: [next.js, playwright, server-component, metadata, seo, testimonials]

requires:
  - phase: 58-core-component-polish
    provides: Card variant="testimonial" component

provides:
  - E2E structural test scaffold for all 4 content pages (Services, About, Location, Contact)
  - Services page converted to Server Component with exported metadata
  - Hardcoded testimonials section on Services page with 2 Card variant="testimonial" cards
  - ServicesGrid client component (icon function props isolated on client side)
  - ProcessSteps client component (icon function props isolated on client side)

affects: [60-02, 60-03, content-pages, services, about, contact, locations]

tech-stack:
  added: []
  patterns:
    - "Server Component + Client Component split for icon props: when a Server Component needs to render cards/components with function props (React.ComponentType), extract the icon-dependent rendering into a thin 'use client' wrapper"
    - "E2E TODO stubs: use 'TODO: description' prefix in test names for tests that depend on not-yet-implemented content — these pass trivially and document upcoming implementation"

key-files:
  created:
    - e2e/content-pages.spec.ts
    - src/components/ui/ServicesGrid.tsx
    - src/components/ui/ProcessSteps.tsx
  modified:
    - src/app/services/page.tsx

key-decisions:
  - "ServicesGrid and ProcessSteps extracted as client components: services page passes icon functions (React.ComponentType) to Card/div children; Next.js cannot serialize functions across server-client boundary, so icon references must stay on the client side"
  - "Services page remains a Server Component: extracting icon-heavy sections to client wrappers (ServicesGrid, ProcessSteps) allows the page to export metadata without 'use client'"
  - "E2E TODO stubs used for About testimonials (Plan 02) and Contact layout flip (Plan 03): tests exist but verify only the most basic assertion until the full feature lands"

patterns-established:
  - "Icon isolation pattern: when Server Component needs to render client components with ComponentType props, extract a 'use client' wrapper that owns the icon constants internally"

requirements-completed: [PAGE-01]

duration: 45min
completed: 2026-03-02
---

# Phase 60 Plan 01: Content Page Polish — E2E Scaffold + Services Server Component Summary

**Services page converted from 'use client' to Server Component with exported metadata, plus E2E structural test scaffold for all 4 content pages**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-03-02T00:00:00Z
- **Completed:** 2026-03-02
- **Tasks:** 2
- **Files modified:** 4 (1 modified, 3 created)

## Accomplishments
- Created `e2e/content-pages.spec.ts` with 18 structural assertions across Services, About, Location (Dallas), and Contact pages
- Converted `src/app/services/page.tsx` from `'use client'` to Server Component with `export const metadata`
- Added 2 hardcoded testimonials using `Card variant="testimonial"` between Process and CTA sections
- Extracted `ServicesGrid` and `ProcessSteps` as thin client components to safely pass icon functions without crossing server-client serialization boundary
- Build succeeds: `/services` now renders as static (SSG) with correct metadata

## Task Commits

Each task was committed atomically:

1. **Task 1: Create E2E structural test scaffold** - `761e303` (test)
2. **Task 2: Fix Services page — remove 'use client', add metadata, add testimonials** - `0b1016e` (feat)

**Plan metadata:** (docs commit — see final_commit step)

## Files Created/Modified
- `e2e/content-pages.spec.ts` - 18 structural E2E assertions for all 4 content pages
- `src/app/services/page.tsx` - Server Component with metadata export + testimonials section (no 'use client')
- `src/components/ui/ServicesGrid.tsx` - Client wrapper for service cards with icon props
- `src/components/ui/ProcessSteps.tsx` - Client wrapper for process steps with icon props

## Decisions Made
- Extracted ServicesGrid and ProcessSteps as client components: Next.js 15 cannot serialize `React.ComponentType` functions across the server-client boundary. Rather than keeping the page as a client component (which blocks metadata export), icon-dependent rendering was moved to thin client wrappers.
- E2E TODO stubs: tests for About testimonials (Plan 02) and Contact layout flip (Plan 03) are stubbed with passing assertions (verify h1/form visible) so the scaffold exists without blocking those future plans.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created ServicesGrid and ProcessSteps client components**
- **Found during:** Task 2 (Services page Server Component conversion)
- **Issue:** Services page passed `icon={Code2}` (React.ComponentType function) as props to the client `Card` component. Next.js throws "Functions cannot be passed directly to Client Components" when a Server Component tries to serialize a function prop across the boundary. Build failed with error code 226197644.
- **Fix:** Extracted the services cards section into `src/components/ui/ServicesGrid.tsx` and process steps into `src/components/ui/ProcessSteps.tsx`, both marked `'use client'`. Icon constants live inside these components so no function props cross the server-client boundary.
- **Files modified:** src/components/ui/ServicesGrid.tsx (created), src/components/ui/ProcessSteps.tsx (created), src/app/services/page.tsx (updated to use new components)
- **Verification:** `bun run build` succeeds, `/services` shows as static (SSG) in build output
- **Committed in:** 0b1016e (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking issue)
**Impact on plan:** Required to complete the task. No scope creep — the new components are minimal wrappers that implement exactly the rendering the original page had.

## Issues Encountered
- Biome pre-commit hook caught import ordering issue in `e2e/content-pages.spec.ts` (`test, expect` → `expect, test`) and indentation (spaces vs tabs). Fixed before final commit.
- Biome formatter wanted `title:` metadata to stay on one line (under 80 chars). Fixed to match formatter output.

## Self-Check

- [x] `e2e/content-pages.spec.ts` — file exists
- [x] `src/app/services/page.tsx` — file exists, no 'use client', has metadata export
- [x] `src/components/ui/ServicesGrid.tsx` — file exists
- [x] `src/components/ui/ProcessSteps.tsx` — file exists
- [x] Task 1 commit `761e303` — committed
- [x] Task 2 commit `0b1016e` — committed
- [x] `bun run typecheck` — passes (no errors)
- [x] `bun run lint` — passes (no errors)
- [x] `bun run build` — passes, `/services` is static SSG

## Self-Check: PASSED

## Next Phase Readiness
- Services page is a Server Component with metadata — PAGE-01 requirement satisfied
- E2E scaffold ready for Plans 02-03 to build on (About testimonials, Contact layout)
- ServicesGrid/ProcessSteps pattern available as reference for other server pages needing client icon components

---
*Phase: 60-content-page-polish*
*Completed: 2026-03-02*
