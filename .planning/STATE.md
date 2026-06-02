---
gsd_state_version: 1.0
milestone: v6
milestone_name: Audit Remediation
current_phase: 11
current_plan: 2
status: executing
last_updated: "2026-06-02T15:16:57.947Z"
last_activity: 2026-06-02
progress:
  total_phases: 6
  completed_phases: 0
  total_plans: 4
  completed_plans: 1
  percent: 25
---

# STATE — Current GSD Position

**Last updated:** 2026-06-02
**Branch:** `main`
**Current milestone:** v6 Audit Remediation (planning — roadmap created, Phases 11-16)
**Current phase:** 11
**Current plan:** 2

## What just happened

- **Phase 11 Plan 01 (`Federal tax-data 2025`) complete (2 commits: `0f8c800`, `5cd20f3`).** Re-keyed `src/lib/paystub-calculator/tax-data.ts` to the official 2025 IRS federal brackets (Rev. Proc. 2024-40) for all five filing schedules: single/MFS share the first six limits but diverge at the 35% ceiling (626350 vs 375800 - RESEARCH Pitfall 7), HoH 32% ceiling is 250500 (not 250525), QSS = MFJ. Social Security wage base raised 168600 to 176100 (SSA 2025 COLA); SS rate, Medicare rate, additional-Medicare rate + thresholds unchanged (statutory). Deleted the stale 2024 entry and the `JSON.parse(JSON.stringify(...))` 2025 deep-clone placeholder; the re-keyed entry is now the single real source. Moved `getTaxDataForYear`'s baseline guard from `taxDataByYear[2024]` to `[2025]` (and the throw message); kept the `Math.max(...availableYears)` fallback as documented defense-in-depth (unreachable from the UI once 11-03 validation lands). Added exported `getSupportedTaxYears()` deriving the year set from `Object.keys(taxDataByYear)` (returns `[2025]`, runtime-verified) as the single source of truth for 11-03 validation and the 11-04 dropdown - no parallel literal. Federal calc consumer for 11-03 golden tests: `calculateFederalTax` (`tax-calculations.ts:4`), SS via `calculateSocialSecurity` (line 76). Test files NOT touched here (owned by 11-03; federal golden assertions expected RED at the Wave-1 boundary by design). PAYSTUB-02 + PAYSTUB-05 marked complete. typecheck green; pre-commit hooks passed both commits. SUMMARY at `.planning/phases/11-paystub-tax-accuracy/11-01-SUMMARY.md`.
- **v6 roadmap created: 6 phases (11 to 16), 15/15 requirements mapped.** Ordered by severity/impact: Phase 11 `paystub-tax-accuracy` (HIGH, PAYSTUB-01..04) first, then Phase 12 `errorboundary-report-path` (MEDIUM, ERR-01), Phase 13 `admin-error-observability` (DECIDE, ADMINERR-01..04 — implements "full error states everywhere", supersedes the v4 return-[]-on-failure lock; `get*ById` failure must NOT become a 404), Phase 14 `admin-page-title` (DECIDE, ADMINUX-01 — RESEARCH-REQUIRED: canonical Next.js 16 metadata/title-template vs per-page heading, chosen at plan-phase), Phase 15 `dead-code-cleanup` (LOW, CLEAN-01..03), and Phase 16 `intentional-noop-confirmation` (DOC, NOOP-01..02) last. Phases appended to `.planning/ROADMAP.md`; REQUIREMENTS.md Traceability filled in (15/15 mapped, 0 unmapped). paystub fix scopes selectable states to supported data (NOT 37 new states = deferred PAYSTUB-F1) and updates the `state-tax-calculations` test that codified silent-$0 as "graceful".
- **v6 milestone started: Audit Remediation.** Driven by a full no-op/stub audit (8-lane parallel finder sweep across all 402 source files, each candidate adversarially verified). 87 candidates resolved to 6 genuine stubs, 50 intentional no-ops, 31 dismissed false positives. Canonical findings at `.planning/v6-AUDIT-FINDINGS.md`. Operator decisions: (1) admin DB-error handling moves to **full error states everywhere** (visible failure-vs-empty distinction across all admin list/widget/queue/detail queries), which **supersedes the v4 locked decision** "each query wraps in try/catch and returns [] on failure"; (2) admin `pageTitle` resolution to be chosen by researching the canonical, most-performant Next.js 16 approach during that phase's planning. Phase numbering continues from v5 (last phase 10), so v6 starts at Phase 11.
- **v5 milestone closed.** All 5 phases shipped (06, 07, 08, 09, 10) + 1 cross-phase hotfix (#226). Audit doc at `.planning/milestones/v5-AUDIT.md` is the canonical record. Pending PR #227 merge applies the planning sync to main.
- **Phase 10 (`admin-list-pagination`) shipped via PR #228 (`870f717`).** Cursor pagination + ILIKE text search across all 7 admin list pages. 20 commits across 3 waves (Wave 1 shared primitives, Wave 2 per-page implementation, Wave 3 verification). 28 changed files (+5050/-565). 112 new test cases / 281 assertions; total suite 724/724 pass. Two post-Wave-1 operator overrides reshaped the implementation: nuqs swap (canonical URL-state library) replaced the original `<form method="get">` plan; shadcn-first primitives (`@/components/ui/table.tsx` + `@/components/ui/pagination.tsx` from the official registry) replaced a custom `admin/Pagination.tsx` wrapper. Two code-reviewer findings on first push (cursor reset on q change + Prev/Next state on backward-nav-to-page-1) fixed pre-merge; 3 review rounds, final zero findings. New `feedback_shadcn_first.md` memory: survey shadcn ecosystem BEFORE writing custom.
- **PR #226 (`9cf7071`) shipped: admin edit-page Loading hotfix.** All 7 admin `[id]` edit/detail pages were stuck on `"Loading..."` in prod -- the resolved form HTML was buffered in `<div id="S:N" hidden>` but React's `$RC` inline reveal script never unhid it. Root cause: `generateStaticParams` returned `[{ id: '__build_placeholder__' }]` (required by `cacheComponents`) and the loader called `await connection()` BEFORE checking the placeholder id, so the prerendered shell was a Suspense-streamed dynamic boundary marked `<!--$~-->` (PPR postponed). `$RC` only handles `<!--$?-->` (regular pending suspense). Fix: short-circuit to `notFound()` before `connection()`/DB read in every loader. The 404 prerender path emits no `$~` marker; real ids skip the short-circuit and render fully dynamic with regular `$?` boundaries. New `src/lib/admin/build-placeholder.ts` owns the canonical `BUILD_PLACEHOLDER_ID` constant + root-cause docblock; new `tests/unit/admin/build-placeholder.test.ts` (23 cases) enumerates the admin tree so a future new dynamic route forces coverage. 3 rounds of independent code-reviewer review (BLOCKING/SHOULD-FIX/NIT all addressed) before merge. Live-verified on prod: served HTML now contains only `<!--$?-->` markers, no `<!--$~-->`.
- **Phase 09 (`blog-rich-text-editor`) shipped via PR #225 (`7778225`).** Replaced the plain `<textarea>` for `blog_posts.content` on `/admin/blog/new` and `/admin/blog/[id]/edit` with a Tiptap-based rich-text editor (StarterKit + Link + Image + the ProseMirror peer dep). New `src/components/admin/RichTextEditor.tsx` (`'use client'`) with toolbar (bold, italic, h1-h3, lists, blockquote, inline code, code block, link via `window.prompt`, image via `window.prompt`, undo, redo, clear); SSR-safe via `immediatelyRender: false` plus a pre-init `aria-busy` shell; ARIA stitched onto the actual contenteditable via Tiptap's `editorProps.attributes` seam. Round-trip contract guarded by `src/components/admin/rich-text-editor-tags.ts` (pure helper `isWithinAllowedHtmlTags`) plus 3 unit tests — editor output is a strict subset of `BlogPostContent.tsx`'s sanitize-html allowedTags. 3 commits: `c678508` (Tiptap deps), `ba4858f` (RichTextEditor + helper + 3 tests), `2b13731` (wire into both forms; hint corrected from `Markdown` to `Rich text`). All gates green: lint, typecheck, 581/581 unit tests (+3), build (199 static pages). Protected files (`BlogPostContent.tsx`, `schemas/blog.ts`, `admin/blog-queries.ts`, `auth/admin.ts`, `proxy.ts`, `src/app/api/**`) byte-equal to origin/main. SUMMARY at `.planning/phases/09-blog-rich-text-editor/09-SUMMARY.md`.
- **Phase 08 (`image-upload-ui`) shipped on `image-uploads`.** Replaced paste-URL friction on all 6 admin form image fields with a real upload widget backed by Vercel Blob. New canonical pattern: `POST /api/admin/images/upload` (single endpoint using `@vercel/blob/client::handleUpload`) + `useBlobUpload` hook + `ImageUploadField` + `ImageGalleryField`. Paste-URL stays as graceful fallback so the PR ships and works even before the operator wires `BLOB_READ_WRITE_TOKEN` to Vercel (route returns 503; client hides Upload button stickily for the session and shows "Uploads disabled. Paste a URL instead."). 5 commits: `5012223` (dep + env + next.config), `31dff69` (API route), `5de4147` (components + hook), `3005c54` (6 form wires + 4 tests), final metadata commit. All gates green: lint, typecheck, 578/578 unit tests (+4), build (199 static pages). Protected files (`src/lib/auth/admin.ts`, `proxy.ts`) byte-equal to origin/main; `src/app/api/**` byte-equal except the new upload route. Operator step before merge: create Vercel Blob store → `BLOB_READ_WRITE_TOKEN` auto-injects → `vercel env pull .env.local` for dev. SUMMARY at `.planning/phases/08-image-upload-ui/08-SUMMARY.md`.
- **Phase 07 (`third-party-logger-compliance`) shipped on `logger-compliance`.** Sink-level PII redaction now applies inside `BaseLogger.log` and `pushToDatabase`. New shared module `src/lib/log-redact.ts` exports `redactSensitive` covering 3 categories — emails (`email`, `recipientEmail`, `userEmail` → `[redacted-email]`), credentials (`password`, `secret`, `apiKey`, `token`, `bearerToken`, `refreshToken`, `accessToken` → `[redacted-secret]`), and IPs (`ip`, `ipAddress` → `[redacted-ip]`). Better Auth's logger config in `src/lib/auth/index.ts` now imports the same module instead of its inline `redactEmails` (extracted from PR #221 `8abaee9`). 11 new unit tests (`tests/unit/log-redact.test.ts`) bring the suite to 574/574. Audit identified 5 PII-bearing call sites in `notifications.ts` + `auth/index.ts` — sink redaction covers them all without call-site edits. 3 `console.*` error-boundary exemptions and 4 in-logger console fallbacks remain documented and untouched. SUMMARY at `.planning/phases/07-third-party-logger-compliance/07-SUMMARY.md`.
- **Phase 06 (`admin-chrome-route-groups`) shipped 4/4 commits on `chrome-route-groups`.** `src/app/` is now split into `(public)/`, `(admin)/admin/`, `(auth)/auth/` route groups. Marketing chrome (NavbarLight + Footer + ScrollToTop) lives in `src/app/(public)/layout.tsx` instead of the root layout; admin and auth pages never inherit it by topology. The `usePathname` early-return in NavbarLight + Footer introduced by PR #218 (`4114d37`) is reverted — the topology-based chrome boundary supersedes the runtime gate. All 4 gates green: lint, typecheck, tests (563/563), build (route table byte-equal to pre-Phase-06 baseline). Phase 02/03/04/05 admin/auth content byte-equal — only file paths moved via `git mv`. Summary at `.planning/phases/06-admin-chrome-route-groups/06-SUMMARY.md`. Commits: `87b1c55`, `d095396`, `467a004`, `a52c85b` (+ this metadata commit).
- **Phase 05 operator smoke closed at 35/35.** Prod read-only sweep 2026-05-24 (19/19 verifiable on `https://www.hudsondigitalsolutions.com`) + local destructive + fixture-blocked sweep 2026-05-25 (16/16 against `http://localhost:3001`, driven via Claude-in-Chrome MCP). Zero failures. Chrome-bleed check PASS. Console-error gate PASS (only pre-fix "Failed to fetch" entries from before the local env-var fix, none during the smoke). 8 `smoke-*@example.com` fixtures seeded + cleaned via `psql`. Gate 14 closed; the result appended to `.planning/phases/05-admin-ops/05-07-VERIFICATION.md`.
- **Smoke surfaced 3 post-ship findings** addressed by this branch (`fix/smoke-audit-findings`): (1) Next.js 16 `data-scroll-behavior="smooth"` attribute now set on `<html>` (silences the per-route scroll-restoration warning); (2) WebVitals dev-console logger now picks `info | warn | error` based on the metric's CWV rating instead of always logging at `warn`; (3) Better Auth's internal logger is now piped through the project logger (CLAUDE.md compliance) with a `redactEmails` walker that masks any `email` / `recipientEmail` field before it reaches the log sink.
- **v4 (Admin Panel) is shipped end-to-end.** 4/4 phases complete on `main`:
  - Phase 02 (`auth-foundation`) via PR #210 (`54603c1`) — Better Auth + sessions + admin role guard + AccountMenu.
  - Phase 03 (`admin-shell-and-dashboard`) via PR #213 (`d88d049`) — Sidebar + Topbar + Forbidden + 5 dashboard widgets.
  - Phase 04 (`admin-content-crud`) via PR #215 (`cf37d1c`) — showcase / blog / testimonials CRUD with Server Actions + TanStack Form.
  - Phase 05 (`admin-ops`) via PR #217 (`5221269`) — leads / calculator-leads / newsletter / emails ops surfaces with `<form action>` Server Actions, 4 queue-health stat cards on /admin/emails.
- **PR #218 (`4114d37`) closed the cross-phase chrome bleed + project-wide em/en-dash sweep** that the per-phase review pipeline had missed (NavbarLight + Footer now self-suppress on `/admin/*` and `/auth/*` via `usePathname`; ~80 em/en-dash CLAUDE.md violations fixed across 30 files). Smoke was what surfaced the gap; future review prompts should include a project-wide CLAUDE.md compliance sweep as a separate concern from per-phase scope.
- Milestone v3 closed: Phase 01 (`showcase-ui-redesign`) shipped via PR #208.

## Active decisions (still in force from v3)

- Featured-first rendering on `/showcase`: `items.find(i => i.featured)` picks the lowest-displayOrder featured row for the full-width slot; support cards force `featured={false}` at the call site.
- Trust signal separators use U+00B7 MIDDLE DOT, never em-dash.
- Accent body copy on light backgrounds uses `text-accent-text` (WCAG-safe).
- Em/en-dash ban (CLAUDE.md) applies to user-facing text only.
- Milestone versions use whole numbers only (v3, v4), never decimals.

## Active decisions (v4)

- Auth library = **Better Auth** (npm `better-auth`). Multi-user sessions, password + OAuth-capable.
- Users live in Neon Postgres (new `users` + `sessions` tables; managed via Better Auth's Drizzle adapter).
- Admin gating = middleware-protected `/admin/*` route group. First user signed up gets `role: 'admin'`; later users default to `role: 'user'` and need promotion.
- Dashboard visual reference = Efferd Dashboard 5 (web analytics layout). Adapted to our design system; not lifting CSS verbatim.
- Admin shell composition is **locked**: `<Sidebar />` (left, `w-60`) + `<Topbar />` (top, `h-14`) + `{children}` (`p-6` md / `p-8` lg). All v4 admin pages render inside this contract.
- Single data seam for admin reads: `src/lib/admin/{dashboard,showcase,blog,testimonials,leads,calculator-leads,newsletter,emails}-queries.ts`. Widgets and pages never import `db` directly.
- Every admin widget owns its own empty state. The page never short-circuits on one widget failing — each query wraps in try/catch and returns `[]` on failure.
- Sidebar `NAV_ITEMS` is the source of truth for the v4 page set. Adding a page = entry in `Sidebar.tsx` + route + queries function (if needed).
- recharts (`3.8.1`) is the v4 chart library. No other chart deps.
- **Phase 04 additions:** Server Actions seam (per-resource `actions.ts`) calls `requireAdminSession()` first then validates with Zod then mutates via Drizzle then `revalidatePath` for public + admin surfaces. Defense-in-depth auth: layer doesn't trust layer. publishedAt semantics differ per resource (showcase + blog have it, testimonials does not). Blog tag set replacement runs inside one Drizzle transaction. Next 16 cacheComponents requires `generateStaticParams()` + `await connection()` placeholder pattern on admin dynamic routes.
- **Phase 05 additions:** Same Server Actions contract as Phase 04 (no new shared helpers — 100% reuse). Detail page IS the edit surface (no `/[id]/edit` split for ops pages since mutations are small and the operator needs context to decide what to change). No useAppForm — every form is `<form action={...}>` + hidden id + submit button. 2 new shared admin primitives reused across all 4 surfaces (`StatusFilterBar` + `StatusBadge`). Filter chips round-trip via `?status=...` query param, server-rendered, zero client JS. `revalidatePath` covers BOTH list AND detail path on every mutation. `'use server'` files must NOT export non-async runtime values (only async functions and `export type` are allowed); validate this in `next build` before relying on lint + typecheck alone.

## Deferred / known issues

- Earlier `v1` / `v1` deferred / `v2` milestones are historical (no `.planning/` artifacts remain).
- 4 location pages (75 cities) shipped in PR #206; no follow-up planned.
- 4 pre-existing em-dashes in `src/components/ui/card.tsx` JSX block comments — out of scope per v3.0/01 verification.
- `industry` prop on `ProjectCardProps` is dead surface (pre-existing); candidate for cleanup if a later v4 phase touches Card again.
- Wave 2 commit-message attribution race recurred in Phase 05 (commit `2445bc1` named "leads Server Actions" actually also contains newsletter Task 1 files). End state is correct; future readers should verify via `git show <hash> --stat`. Mitigation for next parallel-agent phase: stage per-resource into separate sub-working-trees, or serialize commits behind a single coordinator.
- `'use server'` non-async runtime exports are invisible to lint + typecheck — only `next build` catches them. Latent `flattenZod` + `ActionResult` runtime value export in leads/actions.ts went unnoticed until Wave 3 ran the full build. Mitigation: add `bun run build` to the per-task verification command when a future plan ships new `actions.ts` files with shared helpers.

## v6 phase list (Phases 11-16)

| # | Slug | Severity | Requirements | Status |
|---|---|---|---|---|
| 11 | `paystub-tax-accuracy` | HIGH | PAYSTUB-01, PAYSTUB-02, PAYSTUB-03, PAYSTUB-04 | executing (Plan 1/4 complete) |
| 12 | `errorboundary-report-path` | MEDIUM | ERR-01 | not started |
| 13 | `admin-error-observability` | DECIDE | ADMINERR-01, ADMINERR-02, ADMINERR-03, ADMINERR-04 | not started |
| 14 | `admin-page-title` | DECIDE (research) | ADMINUX-01 | not started |
| 15 | `dead-code-cleanup` | LOW | CLEAN-01, CLEAN-02, CLEAN-03 | not started |
| 16 | `intentional-noop-confirmation` | DOC | NOOP-01, NOOP-02 | not started |

Phase details + success criteria in `.planning/ROADMAP.md` (Milestone v6 section).

## Next action

**Plan Phase 11 (`paystub-tax-accuracy`):** `/gsd:plan-phase 11`. It is the HIGH-severity head of v6 (wrong financial output). Scope: restrict the state dropdown to states with real bracket data, remove the dead 2023 year toggle, derive year validation from `Object.keys(taxDataByYear)`, drop redundant flat-0 TX/FL/WA entries, and update the `state-tax-calculations` test that codifies silent-$0 as "graceful". Do NOT add 37 states of bracket data (deferred PAYSTUB-F1).

Carry into v6 planning:

- **Phase 14 (`admin-page-title`) is RESEARCH-REQUIRED at plan-phase:** choose native Next.js 16 metadata/title template vs per-page heading by the most-performant canonical option.
- **Phase 13 (`admin-error-observability`) supersedes the v4 lock:** "full error states everywhere" across the shared `src/lib/admin/*-queries.ts` seam; `get*ById` failure must NOT degrade to a 404.
- Adopt the 4 v5-audit process changes (`.planning/milestones/v5-AUDIT.md`): cross-phase milestone-close gate, "render visibly" vs "exists in DOM" verification, live-prod HTML-marker checks for cacheComponents routes, operator steps as milestone exit criteria. Plus `feedback_shadcn_first.md`: survey shadcn/ui ecosystem BEFORE writing custom UI/helpers.

Operator follow-up still outstanding (independent of v6):

- **Merge PR #227** (audit doc + STATE/ROADMAP sync) to close v5 on main.
- **Wire `BLOB_READ_WRITE_TOKEN` on Vercel** so Phase 08's upload UX is reachable on prod. Live prod `GET /api/admin/images/upload` returns `{"configured": false}`. Steps: create a Vercel Blob store, link to the `hds-website` project so the token auto-injects, then `vercel env pull .env.local` for dev.

## Current Position

Phase: 11 (paystub-tax-accuracy) — EXECUTING
Plan: 2 of 4
Status: Ready to execute
Last activity: 2026-06-02
