# v5 — Admin hardening + content authoring — MILESTONE AUDIT

**Audit date:** 2026-05-27
**Audit branch:** `chore/v5-audit`
**Head at audit:** `9cf7071` (post-PR-#226 merge)
**Status:** v5 closed 2026-05-27 (HEAD `870f717` on main). 5/5 phases shipped (06, 07, 08, 09, 10) + 1 cross-phase hotfix (#226). Phase 10 (`admin-list-pagination`) shipped via PR #228 on operator override of the original defensive-only deferral.

## Scope

End-to-end audit of milestone v5 covering all shipped phases (06-09), the post-merge cross-phase hotfix (#226), and the activation decision for Phase 10. This is the first milestone in the planning history to receive a standalone audit doc; prior milestones (v3, v4) closed via STATE.md updates only.

The audit is doing three things:

1. Verify each shipped phase's claimed outputs against the current `main` and live production (`https://hudsondigitalsolutions.com`).
2. Diagnose the two cross-phase fixes that landed post-milestone-start (PR #218 chrome bleed, PR #226 admin Loading bug) -- why they slipped through per-phase reviews and what process change prevents recurrence.
3. Decide Phase 10's fate by checking actual row counts against the hard caps each list page was scoped against.

## Per-phase verification

### Phase 06 -- `admin-chrome-route-groups` (PR #222, `1211bdc`)

**Claim:** `src/app/` split into `(public)/`, `(admin)/`, `(auth)/` route groups. `NavbarLight` + `Footer` moved into `(public)/layout.tsx`. The `usePathname` self-suppression PR #218 added is reverted.

**Verified:**

- All 3 route groups present on disk under `src/app/`.
- `src/app/layout.tsx` no longer mounts `NavbarLight` / `Footer` (only a docstring reference remains explaining why chrome lives in route-group layouts).
- `src/app/(public)/layout.tsx` mounts `NavbarLight` + `Footer` + named `<main id="main-content">` landmark.
- `src/components/layout/Footer.tsx` has no `usePathname` and no `/admin`-aware early return.
- `src/components/layout/Navbar.tsx` retains `usePathname` only for nav-link active state, NOT for self-suppression (the self-suppression added by PR #218 is removed per Phase 06 docstring).
- Live prod: GET `/` returns 25 occurrences of "Hudson Digital" + 2 skip-link references (chrome present). GET `/admin` returns 0 occurrences of "Schedule" / "Discovery Call" / `footer` / `navbar` (chrome boundary working).

**Status:** PASS

### Phase 07 -- `third-party-logger-compliance` (PR #223, `41c6295`)

**Claim:** Sink-level PII redaction via shared `src/lib/log-redact.ts`. `BaseLogger.log` + `pushToDatabase` mask metadata before stdout / Postgres / external webhooks. Better Auth logger pipes through the same redactor.

**Verified:**

- `src/lib/log-redact.ts` exports `redactSensitive` + `SENSITIVE_FIELDS` covering 3 categories (email / secret / ip).
- `src/lib/logger.ts` imports `redactSensitive` and applies it to `data`, `context`, and `payload.metadata`.
- `src/lib/auth/index.ts` imports `redactSensitive` and applies it in the Better Auth `logger` config (`args.map(redactSensitive)`).
- `tests/unit/log-redact.test.ts` present (11 cases per Phase 07 SUMMARY).
- Live prod redaction confirmed in the prior operator probe (2026-05-26): test email `redaction-probe-2026-05-26@example.invalid` triggered a "User not found" log entry; Postgres `error_logs.user_email` showed the literal sentinel, never the input value. Recorded in STATE.md.

**Status:** PASS

### Phase 08 -- `image-upload-ui` (PR #224, `c70fd3d`)

**Claim:** Vercel Blob upload widgets wired into all 6 admin form image fields. Single `POST /api/admin/images/upload` route. 503 fast-fail keeps the paste-URL fallback working before the operator wires `BLOB_READ_WRITE_TOKEN`.

**Verified:**

- `src/app/api/admin/images/upload/route.ts` present, uses `handleUpload` from `@vercel/blob/client`, checks `env.BLOB_READ_WRITE_TOKEN` and 503s when unset.
- `src/hooks/use-blob-upload.ts` + `src/components/admin/ImageUploadField.tsx` + `src/components/admin/ImageGalleryField.tsx` all present.
- Live prod GET `/api/admin/images/upload` returns `{"configured":false}` -- the operator step (`BLOB_READ_WRITE_TOKEN` on Vercel) is **still outstanding**. Paste-URL fallback is the active code path on production right now.

**Status:** CODE PASS / OPERATOR STEP PENDING

**Open item:** Operator must create a Vercel Blob store, link to the project so `BLOB_READ_WRITE_TOKEN` auto-injects, then optionally `vercel env pull .env.local` for dev. Until then, all admin image fields fall back to URL paste. The fallback is functional but the upload UX shipped in Phase 08 is not actually reachable in prod.

### Phase 09 -- `blog-rich-text-editor` (PR #225, `7778225`)

**Claim:** Tiptap-based `RichTextEditor` (StarterKit + Link + Image) replaces the `<textarea>` on `/admin/blog/{new,[id]/edit}`. HTML output is a strict subset of `BlogPostContent.tsx`'s sanitize-html allowedTags. Public render path untouched.

**Verified:**

- `src/components/admin/RichTextEditor.tsx`, `src/components/admin/rich-text-editor-tags.ts`, `tests/unit/rich-text-editor.test.ts` all present.
- `git diff origin/main -- src/components/blog/BlogPostContent.tsx` is empty (public render path byte-equal to pre-phase).
- `RichTextEditor` imported in both `src/app/(admin)/admin/blog/new/CreateBlogForm.tsx` and `src/app/(admin)/admin/blog/[id]/edit/EditBlogForm.tsx`.
- Round-trip guard intact: `ALLOWED_HTML_TAGS` mirrors `BlogPostContent.tsx`'s SANITIZE_OPTIONS allowedTags.

**Status:** PASS

**Note:** Phase 09 live-verification is what surfaced the cross-phase Loading bug fixed in PR #226 (see next section). Phase 09 itself is correct; the bug it exposed predates this phase.

## Cross-phase regressions

Two cross-phase fixes landed during v5 that the per-phase review pipeline did not catch:

### PR #218 (`4114d37`, 2026-05-24) -- admin/auth chrome bleed + em-dash sweep

**What was wrong:** `NavbarLight` and `Footer` rendered unconditionally on every route, including `/admin/*` and `/auth/*`. Marketing chrome leaked into the admin shell. Em/en-dashes (banned per CLAUDE.md for user-facing text) had accumulated across 30 files via repeated parallel-agent work.

**Why it slipped:** Phases 02 (auth), 03 (admin shell), 04 (content CRUD), 05 (ops) each verified "admin pages render correctly" in isolation. None verified "admin pages render WITHOUT marketing chrome bleeding in" because none owned the boundary -- chrome lived in the root layout from Phase 01 era and was never a phase-scoped concern.

**Surfaced by:** Phase 05 operator smoke (2026-05-24/25, 35/35 checks). The cross-phase issue was visible to anyone navigating between `/` and `/admin/*` but invisible to per-phase verification gates.

**Canonical fix:** Phase 06 (route-group split) is the architecturally correct fix; PR #218 was the tactical fix shipped before Phase 06.

### PR #226 (`9cf7071`, 2026-05-27) -- admin edit pages stuck on "Loading..."

**What was wrong:** All 7 admin `[id]` edit/detail pages served a Suspense fallback (`"Loading..."`) indefinitely in production. The resolved form HTML was streamed into the DOM inside `<div id="S:N" hidden>` but React's `$RC` inline reveal script never unhid it.

**Root cause:** Each page exported `generateStaticParams` returning `[{ id: '__build_placeholder__' }]` to satisfy `cacheComponents`. At build time the loader called `await connection()` BEFORE checking the placeholder id, so the prerendered shell was a Suspense-streamed dynamic boundary marked `<!--$~-->` (PPR postponed). React's `$RC` only handles `<!--$?-->` (regular pending suspense), so on production the postponed shell never resumed.

**When the bug was introduced:** Phase 04 (PR #215, `cf37d1c`, 2026-05-23). The "Phase 04 active decisions" entry in STATE.md captures the original (broken) canonical: "Next 16 cacheComponents requires `generateStaticParams()` + `await connection()` placeholder pattern on admin dynamic routes". Phase 05 (PR #217, `5221269`) inherited it via the parallel-agent template. The defect surface widened with every admin `[id]` route added.

**Why it slipped:** `bun run build` was green (the placeholder prerender succeeded as 404). Per-phase static review gates only check the shell renders, not that real-id requests resolve. Browser-automation verification (used during Phase 09 live-verify) caught the form's PRESENCE in the DOM via `querySelectorAll`, which traverses into `<template>` and hidden buffers -- but never checked the form was VISIBLE (`offsetParent !== null` or computed style).

**Surfaced by:** Phase 09 live-verification via Claude-in-Chrome MCP (2026-05-26).

**Canonical fix:** PR #226 moves the placeholder-id check before `await connection()` in every loader so the prerender renders the 404 path with no Suspense boundary, and adds `src/lib/admin/build-placeholder.ts` (shared constant + canonical docblock) + `tests/unit/admin/build-placeholder.test.ts` (23-case regression suite enumerating the admin tree so a future new dynamic route forces coverage).

## Process changes for v6+

The two regressions above share a pattern: **per-phase reviews verify the phase's outputs in isolation, but a phase's outputs interact with shared infrastructure (chrome, generateStaticParams patterns, auth gates, edge cache behavior) that no single phase owns.** The fix is not "more thorough per-phase reviews" -- the fix is to bolt a cross-phase sweep onto the milestone close.

Concrete recommendations:

1. **Milestone close gate.** Before closing any milestone, run a cross-phase audit covering (a) chrome/layout boundaries, (b) prerender / cache / PPR markers in served HTML, (c) auth gate placement, (d) shared canonical patterns (`generateStaticParams`, `cacheComponents`, `'use server'` non-async exports). This audit is the gate; if it fails, the milestone doesn't close.

2. **Verification = "does it render visibly", not "does it exist in the DOM"**. When a browser-automation agent is asked to verify a UI surface, the assertion shape is `getComputedStyle(el).display !== 'none' && el.offsetParent !== null && el.innerText.length > N`, not `querySelectorAll(selector).length > 0`. `querySelector*` traverses through `<template>` and hidden Suspense buffers; `innerText` and `offsetParent` do not.

3. **Live-prod HTML markers in the gate.** For routes that use Suspense + dynamic data + `cacheComponents`, the milestone close should assert that served HTML contains `<!--$?-->` and NOT `<!--$~-->`. The `$~` marker means a postponed PPR boundary the client can't reveal (the Phase 04 inheriting pattern). One curl + grep is sufficient.

4. **Document operator steps as milestone exit criteria, not phase exit criteria.** Phase 08 shipped technically complete but the upload UX is not actually reachable in prod because `BLOB_READ_WRITE_TOKEN` was never wired. Per-phase "operator step deferred" notes are easy to lose track of when 5 phases ship in 3 days. Pull all per-phase operator steps into the milestone audit checklist.

## Phase 10 activation decision

Phase 10 (`admin-list-pagination`) was scoped defensively per ROADMAP: "activate when any table exceeds the cap in real load".

Current row counts vs hard caps (queried 2026-05-27 against `neondb`, `pg_stat_user_tables`):

| Table | Hard cap | Rows | % of cap |
|---|---|---|---|
| `showcase` | 50 | 4 | 8% |
| `blog_posts` | 50 | 11 | 22% |
| `testimonials` | 50 | 0 | 0% |
| `leads` | 200 | 1 | 0.5% |
| `calculator_leads` | 200 | 0 | 0% |
| `newsletter_subscribers` | 200 | 23 | 11.5% |
| `scheduled_emails` | 100 | 2 | 2% |

No table currently exceeds 25% of its cap. The defensive-only threshold would have deferred Phase 10.

**Decision: Phase 10 shipped in this audit cycle on operator override.** The defensive-only deferral was overridden: Phase 10 was scoped INTO v5 close. Rationale: shipping the pagination + search surface now (a) avoided a future "v5 follow-up" milestone for one phase, (b) front-loaded the UX before any of the smaller tables (showcase, blog) need it, and (c) gave the operator a search-by-text capability against ops tables (leads, newsletter, emails) where row counts grow with real traffic and search is the actual need, not pagination.

Phase 10 was shipped via PR #228 (commit `870f717` on main) — see the row below.

### Phase 10 execution notes (post-ship)

20 commits across 3 waves: 1 CONTEXT, 5 Wave-1 (shared primitives), 13 Wave-2 (7 list pairs + their SUMMARYs), 1 Wave-3 (verification + phase SUMMARY). 28 changed source/test files: +5050 / -565. 112 new test cases / 281 new assertions across 8 new test files under `tests/unit/admin/`.

Two post-Wave-1 operator overrides reshaped the implementation mid-flight (both documented in `.planning/phases/10-admin-list-pagination/10-01-SUMMARY.md`):

1. **nuqs swap.** Original plan locked `<form method="get">` SearchInput. Operator pointed out nuqs is the project's canonical URL-state library (root-mounted via `<NuqsAdapter>`, used by every calculator route). SearchInput rewritten as `'use client'` using `useQueryState('q', parseAsString.withDefault('').withOptions({ shallow: false, throttleMs: 300, clearOnDefault: true }))`.
2. **shadcn-first primitives.** Original plan called for custom `admin/Pagination.tsx` wrapper. Operator pointed out shadcn ships canonical `Table` + `Pagination` primitives. Custom wrapper deleted; Wave 2 pages compose shadcn primitives directly with `buildPaginationHref` from `list-cursor.ts` deduping URL ceremony. Added a `feedback_shadcn_first.md` memory: survey shadcn ecosystem BEFORE writing custom.

Two code-reviewer findings on the first PR push (both fixed pre-merge):

- **BLOCKING:** SearchInput preserved `?cursor=` across q changes. Searching on page 2+ filtered the AFTER-cursor slice for ILIKE matches, missing hits earlier in the dataset. Fix: second `useQueryState('cursor')` + `setCursor('')` in the same `onChange` handler.
- **SHOULD FIX:** Backward-navigation to page 1 emitted broken Prev/Next button state in all 7 helpers. Fix: gate `nextCursor` on `(hasMore || direction === 'before')` and `prevCursor` on `(direction !== 'before' || hasMore)`. New regression test per helper.

Final state: 3 rounds of code review (round 3 zero findings). 724 tests pass. All 7 CI checks green pre-merge.

## v5 close

| Phase | Status | PR | Note |
|---|---|---|---|
| 06 admin-chrome-route-groups | shipped | #222 | route-group canonical |
| 07 third-party-logger-compliance | shipped | #223 | sink-level redaction live |
| 08 image-upload-ui | shipped (code), pending operator | #224 | `BLOB_READ_WRITE_TOKEN` not yet on Vercel |
| 09 blog-rich-text-editor | shipped | #225 | Tiptap in both blog forms |
| 10 admin-list-pagination | shipped | #228 | cursor + nuqs search + shadcn primitives |
| -- (cross-phase) admin Loading hotfix | shipped | #226 | postponed-PPR-boundary fix |

v5 is closed. The 4 process-change recommendations above belong in v6's first phase if v6 happens; otherwise they sit in this doc as the canonical record of what slipped past v5's per-phase gates.
