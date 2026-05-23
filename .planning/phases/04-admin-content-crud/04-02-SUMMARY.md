---
phase: 04-admin-content-crud
plan: 02
subsystem: admin-showcase
tags: [admin, crud, showcase, server-actions, tanstack-form, zod, drizzle]
dependency-graph:
  requires:
    - 04-01 (shared admin helpers + UI primitives)
    - Phase 02 (Better Auth session)
    - Phase 03 (admin layout + Forbidden gate)
  provides:
    - admin showcase CRUD (list, create, edit, delete, publish toggle)
    - publishedAt false->true / true->false transition semantics
    - reusable per-resource pattern for Plans 04-03 and 04-04
  affects:
    - none on the public surface (src/lib/showcase.ts byte-equal to main)
tech-stack:
  added: []
  patterns:
    - server-only Drizzle helpers next to dashboard-queries.ts
    - Server Actions as the sole admin mutation seam (CONTEXT.md D-02)
    - useAppForm field bindings with explicit FormData submission
    - revalidatePath after every mutation (D-11)
    - requireAdminSession() as first statement in every action (D-12)
key-files:
  created:
    - src/lib/schemas/admin-showcase.ts
    - src/lib/admin/showcase-queries.ts
    - src/app/admin/showcase/actions.ts
    - src/app/admin/showcase/page.tsx
    - src/app/admin/showcase/new/page.tsx
    - src/app/admin/showcase/new/CreateShowcaseForm.tsx
    - src/app/admin/showcase/[id]/edit/page.tsx
    - src/app/admin/showcase/[id]/edit/EditShowcaseForm.tsx
    - tests/unit/schemas/admin-showcase.test.ts
  modified: []
decisions:
  - "Form shape declared explicitly (not derived via z.input) so TanStack Form
    field bindings have a stable concrete value type for every field — z.input
    on coerce/default chains resolves to {} which the input value props reject."
  - "Edit form stays on the page after save (Saved. banner) instead of
    redirecting to the list, so scroll position is preserved (CONTEXT.md
    verification step explicitly let the planner pick)."
  - "Metrics input is a JSON textarea rather than a key/value editor — keeps
    the create form one client island and dodges the YAGNI line in 5.1."
metrics:
  duration: "single session"
  completed: 2026-05-23
---

# Phase 04 Plan 02: Showcase CRUD Summary

Ships the admin showcase vertical slice (list, create, edit, delete, publish
toggle) on top of the shared helpers + UI primitives delivered by Plan 04-01.
Replaces the direct-SQL / Neon MCP workflow currently used to maintain
`/showcase` rows. Public `/showcase` reads continue to flow through the
unchanged `src/lib/showcase.ts`.

## Files Created (8 source + 1 test)

| Path                                                              | Role                                                       |
| ----------------------------------------------------------------- | ---------------------------------------------------------- |
| `src/lib/schemas/admin-showcase.ts`                               | Zod create + update schemas, all 30 columns                |
| `src/lib/admin/showcase-queries.ts`                               | server-only Drizzle list/get/create/update/delete/toggle   |
| `src/app/admin/showcase/actions.ts`                               | 4 Server Actions (`'use server'`)                          |
| `src/app/admin/showcase/page.tsx`                                 | Server list page (Suspense + `await connection()`)         |
| `src/app/admin/showcase/new/page.tsx`                             | Server shell for create                                    |
| `src/app/admin/showcase/new/CreateShowcaseForm.tsx`               | Client create form (all 30 columns)                        |
| `src/app/admin/showcase/[id]/edit/page.tsx`                       | Server shell for edit (loads row, 404s on miss)            |
| `src/app/admin/showcase/[id]/edit/EditShowcaseForm.tsx`           | Client edit form + DeleteButton                            |
| `tests/unit/schemas/admin-showcase.test.ts`                       | 15 unit tests pinning the Zod contract                     |

## Tests

- `tests/unit/schemas/admin-showcase.test.ts`: 15 tests / 33 assertions
- All pass under `bun test tests/unit/schemas/admin-showcase.test.ts`

## Gate Results

| Gate                                                                                                           | Result    |
| -------------------------------------------------------------------------------------------------------------- | --------- |
| `bun run lint` (all `src/`)                                                                                    | exits 0   |
| `bun run typecheck`                                                                                            | exits 0   |
| `bun test tests/unit/schemas/admin-showcase.test.ts`                                                           | 15 pass   |
| `rg -F '—' <showcase files>`                                                                                   | empty     |
| `rg -F '–' <showcase files>`                                                                                   | empty     |
| `grep -c "await requireAdminSession" src/app/admin/showcase/actions.ts`                                        | 5 (4 calls + 1 in doc comment) |
| `grep -c "revalidatePath" src/app/admin/showcase/actions.ts`                                                   | 8         |
| `rg "console\." <showcase files>`                                                                              | empty     |
| `rg "process\.env" <showcase files>`                                                                           | empty     |
| `rg ": any\b\|<any>" <showcase files>`                                                                         | empty     |
| `git diff main -- src/lib/showcase.ts src/lib/schemas/showcase.ts src/app/showcase/ src/app/portfolio/`        | empty     |
| `git diff main -- src/lib/auth/ src/components/auth/ src/app/auth/ proxy.ts src/lib/auth/admin.ts`             | empty     |
| `git diff main -- src/lib/admin/dashboard-queries.ts src/app/admin/{layout,page,dashboard/page}.tsx`           | empty     |
| `git diff main -- src/components/admin/{Sidebar,Topbar,Forbidden}.tsx src/components/admin/widgets/`           | empty     |
| `git diff main -- src/app/api/blog/posts/route.ts`                                                             | empty     |
| `git diff main -- "src/app/admin/(coming-soon)/showcase/page.tsx"`                                             | empty     |
| `git diff c3572b6 HEAD -- <Wave 1 files>`                                                                      | empty     |

## Self-Check

| Claim                                                              | Verified |
| ------------------------------------------------------------------ | -------- |
| `src/lib/schemas/admin-showcase.ts` exists                         | FOUND    |
| `src/lib/admin/showcase-queries.ts` exists                         | FOUND    |
| `src/app/admin/showcase/actions.ts` exists                         | FOUND    |
| `src/app/admin/showcase/page.tsx` exists                           | FOUND    |
| `src/app/admin/showcase/new/page.tsx` exists                       | FOUND    |
| `src/app/admin/showcase/new/CreateShowcaseForm.tsx` exists         | FOUND    |
| `src/app/admin/showcase/[id]/edit/page.tsx` exists                 | FOUND    |
| `src/app/admin/showcase/[id]/edit/EditShowcaseForm.tsx` exists     | FOUND    |
| `tests/unit/schemas/admin-showcase.test.ts` exists (15 pass)       | FOUND    |
| Commit `3c39538` (schemas + queries, correctly attributed)         | FOUND    |

## Commit Attribution Note (Wave 2 git index race)

Wave 2 ran three executors in parallel inside a single working tree.
Showcase, blog, and testimonials each created their files independently
and then `git add`ed them simultaneously. Because the parallel processes
share one git index, two pairs of commits ended up with crossed file
contents while keeping the original commit messages.

| Commit hash | Commit message claims                                          | Actually contains                                       |
| ----------- | -------------------------------------------------------------- | ------------------------------------------------------- |
| `3c39538`   | `feat(04-02): admin showcase schemas and queries`              | Showcase schemas + queries + test (CORRECT)             |
| `a0128f3`   | `feat(04): testimonials CRUD vertical slice (admin)`           | The six showcase pages owned by THIS plan               |
| `3cea181`   | `feat(04): admin blog CRUD pages, forms, and Server Actions`   | This `04-02-SUMMARY.md` document                        |

The Plan 04-02 showcase pages physically live in commit `a0128f3` despite
its message attributing them to "testimonials CRUD". The 04-02 SUMMARY
itself was swept into commit `3cea181` ("admin blog CRUD ..."). The actual
testimonials and blog plans re-staged their own files after the race and
committed them separately. The on-disk file manifest and the file contents
were diff-confirmed against the in-memory drafts produced by this executor
before handing off.

Counts and contents are functionally correct: every file in the manifest
exists in HEAD with the intended content, all gates pass, all schemas /
queries are covered by the test suite. The misattribution is a recording
issue, not a correctness issue. The verifier and Plan 04-05 cleanup pass
should treat the file set as the source of truth, not the commit messages.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocker] FormShape derived from `z.input` resolved to `{}` for
defaulted Zod fields, breaking TanStack Form value props**

- **Found during:** Task 2, first `bun run typecheck` of the create form
- **Issue:** `z.input<typeof createShowcaseSchema>` returns `unknown | undefined`
  for fields like `z.coerce.boolean().default(false)` and
  `z.coerce.number().int().default(0)`. TypeScript then resolves
  `field.state.value` to `{}` for those fields, which the `<input value=...>`
  and `<input checked=...>` props reject as not assignable to
  `string | number | readonly string[]` / `boolean`.
- **Fix:** Replaced `type FormShape = z.input<typeof createShowcaseSchema>`
  with an explicit object type that declares every field with its concrete
  resting type (e.g. `featured: boolean`, `teamSize: number | null`). The
  Zod schema is still the safeParse source of truth on the server; the
  client just needs a stable value type for binding.
- **Files modified:** `src/app/admin/showcase/new/CreateShowcaseForm.tsx`
- **Captured in:** the same Task 2 commit (no separate fix commit needed)

**2. [CLAUDE.md project rule precedence] Two em-dashes in doc comments**

- **Found during:** em/en-dash sweep before commit
- **Issue:** Two `—` characters in code comments. CLAUDE.md exempts code
  comments from the no-em-dash rule, but the plan's verification gate
  required `rg -F '—' <files>` to return empty.
- **Fix:** Replaced both with `;` / `,` / plain ASCII alternatives. Plan-level
  gate wins over the CLAUDE.md carve-out for this phase.
- **Files modified:** `src/app/admin/showcase/[id]/edit/page.tsx`,
  `src/app/admin/showcase/actions.ts`

### Other observations

- Did not modify Wave 1 files (verified via
  `git diff c3572b6 HEAD -- <Wave 1 paths>` = empty).
- Did not modify any Phase 02/03 file (verified via diff vs main).
- Did not modify `src/lib/showcase.ts` or `src/app/showcase/*` (D-14).
- Did not delete `src/app/admin/(coming-soon)/showcase/page.tsx` (Wave 3 owns it).
- Did not run `bun run build` (planner instruction: deferred to Wave 3/4
  because the coming-soon route group still coexists with the real route
  and build-time route collision is acceptable until Wave 3 removes the stub).

## Known Stubs

None. Every column from `src/lib/schemas/showcase.ts` is bound to a form
field in both the create and edit forms.

## Threat Flags

None new. Admin endpoints inherit the existing Better Auth + admin-layout
gate, and every Server Action adds the `requireAdminSession()` defense-in-
depth check the CONTEXT threat model already specified.
