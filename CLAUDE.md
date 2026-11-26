# CLAUDE.md

**NO EMOJIS** - Never use emojis unless explicitly requested. Use Heroicons/Lucide React for UI icons.
**NO EM/EN DASHES IN USER-FACING TEXT** - Never use em-dash (—, U+2014) or en-dash (–, U+2013) in any string that ships to the browser: JSX text nodes, JSX attribute values that render (alt, title, aria-label, placeholder), `metadata` exports, JSON-LD / structured-data text, error messages shown to users, email templates, and structured DB content (showcase descriptions, etc.). Replace with: comma, period, hyphen (-), "to" (ranges), or rephrase. **Code comments and developer-only strings (test fixture names, log messages) are exempt** — they never reach a user. Applies project-wide.
**SEARCH FIRST** - This project uses standard patterns. Find an existing example in the codebase before adding new code.

## CORE PRINCIPLES

- **SIMPLICITY**: Use native features first. No unnecessary abstractions.
- **TYPE SAFETY**: TypeScript strict mode. NO `any` types. Validate at boundaries with Zod.
- **SERVER-FIRST**: Default to Server Components. Client components only for hooks/events/browser APIs.
- **YAGNI**: Don't build for hypothetical requirements. No speculative code, schemas, endpoints, or libs.
- **COMPOSITION OVER INHERITANCE**: Combine small components. No deep class hierarchies.
- **EXPLICIT DATA FLOW**: Every cross-module value is typed. Validate at the boundary, trust inside.
- **SINGLE RESPONSIBILITY**: One reason to change per module. Split when concerns multiply.
- **FAIL FAST**: Validate inputs immediately. Throw specific, actionable errors. No silent recovery.
- **IDEMPOTENCY**: State-changing operations must produce the same result when retried.
- **READABILITY OVER CLEVERNESS**: Code is read more than written.

## STACK

- **Framework**: Next.js 16 (App Router) + React 19
- **Runtime / PM**: Bun 1.3.x
- **Lint / Format**: Biome 2.5.15 (`biome.json`)
- **DB**: Neon Postgres + Drizzle ORM 0.45 — client `src/lib/db.ts`, schema barrel `src/lib/schemas/schema.ts`
- **Forms**: `@tanstack/react-form` via factory in `src/hooks/form-hook.tsx`
- **Validation**: Zod 4
- **Toasts**: Sonner (no custom provider)
- **Email**: Resend (`src/lib/resend-client.ts`)
- **Tests**: `bun:test` for unit, Playwright for e2e
- **Env**: `@t3-oss/env-nextjs` — typed env in `src/env.ts`. Never read `process.env.X` directly.

## FILE ORGANIZATION

- `src/proxy.ts` - Proxy (Next.js 16 rename of middleware.ts; Node.js runtime). Must live in `src/`, not the project root: Next only loads `proxy.ts` and `instrumentation*.ts` from the directory that holds `app/`, and the app is in `src/app`. Owns security headers (CSP built in `src/lib/security-headers.ts`), UA blocklist, CORS, and the `/admin` session-cookie gate. Does NOT set Cache-Control (cacheComponents and route handlers own caching) or redirect to HTTPS (Vercel does that at its edge). NOT CSRF or rate-limit — those moved to `src/lib/api/guards.ts::withMutationGuards` for per-route control. Its matcher skips static assets, metadata routes, prefetches and the Sentry tunnel (`/monitoring`) to limit Vercel function invocations. Don't recreate `middleware.ts`.
- `src/instrumentation.ts` / `src/instrumentation-client.ts` - Sentry server and browser init (same `src/` rule as the proxy). Both no-op without a DSN. Set `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` together: `next.config.ts` adds the `/monitoring` tunnel when either is present at build, and the CSP does not allow direct Sentry ingest.
- `src/app/` - App Router pages, layouts, API route handlers
- `src/app/actions/` - Server Actions (currently: `ttl-calculator.tsx`)
- `src/app/api/` - API routes (calculators, contact, csp-reports, health, newsletter, pagespeed, process-emails, rss, testimonials, web-vitals)
- `src/components/layout/` - `Navbar.tsx` (exported as `NavbarLight`), `Footer.tsx`
- `src/components/forms/` - `ContactForm`, `NewsletterSignup`, `FormField`, `FormSuccessMessage`
- `src/components/ui/` - Base primitives (button, card, input, label)
- `src/components/utilities/` - Cross-cutting components (`Icon`/`IconButton`, `Analytics`, `JsonLd`, `ScrollProgress`)
- `src/lib/` - Core utilities (partial: `db`, `logger`, `errors`, `analytics`, `seo-utils`, `seo-config`, `csrf`, `rate-limiter`, `resend-client`, `contact-service`, `scheduled-emails`, `email-utils`, `notifications`, `request`, `security-headers`, `attribution`, plus per-domain modules `blog`, `showcase`, `testimonials`, `help-articles`, `paystub-calculator/`, `pdf/`, `ttl-calculator/`)
- Server-only modules (`db`, `resend-client`, `contact-service`, `scheduled-emails`, `testimonials`) import `'server-only'` to fail-fast on accidental client imports
- `src/lib/auth/admin.ts` - Bearer-token guard for admin/cron endpoints (no user auth in this app)
- `src/lib/schemas/` - Drizzle table schemas + Zod schemas; barrel at `schema.ts`
- `content/blog/` - Blog posts (one Markdown file per post). The ONLY source of truth for the blog; see Blog under INTEGRATIONS
- `src/lib/constants/` - Domain constants (`business.ts` etc.)
- `src/types/` - Shared TypeScript types
- `src/hooks/` - Custom React hooks
- `tests/unit/` - `bun:test` unit tests
- `e2e/` - Playwright specs

## PATTERNS

**Metadata:**
- Export `metadata` from server page components (`'use client'` files cannot export `metadata`)
- Description 120-160 chars for SEO
- Structured data via `<JsonLd />` (`src/components/utilities/JsonLd.tsx`), not `metadata.other`
- Use `generateWebsiteSchema`, `generateOrganizationSchema` from `src/lib/seo-utils.ts`

**Hooks:**
- `useState` for local UI state only
- `useRef` for non-reactive values (timers, RAF IDs)
- `useCallback` for stable refs passed to memoized children

**Forms (`@tanstack/react-form`):**
- Build typed forms with the factory in `src/hooks/form-hook.tsx`; shared context in `src/hooks/form-context.ts`
- Validate with Zod (`zodSchema` adapter) using schemas from `src/lib/schemas/`
- Submit via API route (e.g., `/api/contact`) or Server Action
- `useActionState`/`useFormStatus` is used in `src/app/unsubscribe/UnsubscribeForm.tsx`; not the default for new forms

**Toasts (Sonner):**
- Mount `<Toaster />` from `sonner` once near the root
- Call `toast.success(...)`, `toast.error(...)` directly — no custom provider

**Error Handling:**
- `src/lib/logger.ts` has a private `castError` that normalizes `unknown` to `ErrorLogData`. `logger.error(message, error?)` already accepts `Error | unknown` and normalizes internally, so pass the caught `error` directly. Do NOT cast (`error as Error`) before logging, and do NOT add a separate `instanceof Error ? ... : new Error(...)` re-cast for the logger.
- Wrap async ops in try/catch
- Log via `logger.error` — never `console.*`
- Return user-friendly messages; never expose internals

**Tailwind v4 / Styling:**
- Defined in `src/app/globals.css` via `@utility` blocks and class rules
- Available: `.glass-card`, `.glass-card-light`, `.hover-lift`, `.card-hover-glow`, `.text-eyebrow`, `.link-primary`, `.field`; utilities `transition-smooth`, `card-padding` (`-sm` / `-lg`), `container-wide`, `container-content`, `grid-pattern`
- Focus styling is native via `:focus-visible` in globals.css — there is no `.focus-ring` class
- Use CSS custom properties, not hard-coded values
- **Accent and status colours as text:** `text-accent` (2.49:1) is for fills, borders and decorative icons only; accent-coloured text uses `text-accent-text`. Base `warning` is never text (use `text-warning-text`); prefer the `*-text` shade for status text. Hover on accent text is `hover:text-accent-text` or `hover:underline`, never an opacity fade. `tests/unit/css-contrast.test.ts` pins the token ratios and fails on accent/warning text
- **Form fields:** every text input, select and textarea (ui primitives and native controls) uses the `.field` class in globals.css (border `--color-input` at >= 3:1, muted fill, 16px text, 44px min height, `aria-invalid` turns it destructive). Add only layout utilities (`w-auto`, `flex-1`, `font-mono`, `text-right`). Native checkboxes are `size-4 accent-primary`
- **Type scale and headings:** one scale, the `--text-*` steps in `@theme`. `text-page-title` on every page H1 (tool pages included), `text-h1`..`text-h4` for section headings, `text-lead` for intro copy, `.text-eyebrow` for small uppercase labels. These own size, line-height, tracking and weight, so never add `leading-*`, `tracking-*` or a font-weight utility to them. No arbitrary `text-[..]` sizes and nothing under `text-xs` (12px). `tests/unit/css-type-scale.test.ts` enforces this
- **Containers and gutters:** two page containers, `container-wide` (80rem: multi-column layouts, navbar, footer, heroes) and `container-content` (56rem: reading measure). Both pad with the one responsive `--page-gutter` (16 / 24 / 32px). Never add `px-*`, `max-w-*` or `mx-auto` next to them, and never put horizontal padding on a `<section>`: the container inside it owns the content edge. Breakpoints come from the theme (rem), no px media queries
- **Buttons:** every button and CTA is `<Button>` (or `buttonVariants()` on a server-rendered `Link`). One radius, one weight and a 44px minimum height on every variant and size; `variant="outline-strong"` is the secondary CTA beside an `accent` one. No hand-built filled CTA class lists. `tests/unit/css-layout.test.ts` enforces containers, breakpoints and buttons
- **Colour tokens:** one system, the shadcn names (`background`, `foreground`, `card`, `popover`, `muted`, `secondary`, `accent`, `destructive`, `border`, `input`, `ring`, `overlay`, plus the status `-light` / `-muted` / `-text` shades). No `surface-*` or `text-*` aliases and no raw `black` / `white` utilities
- **Radius:** three steps, `rounded-md` (controls, chips, menu items, skeleton lines), `rounded-xl` (cards, panels, tiles, images) and `rounded-2xl` (large feature surfaces), plus `rounded-full`. Bare `rounded`, `rounded-sm` and `rounded-lg` build no CSS. Component CSS and inline styles use `var(--radius-md|xl|2xl)`
- **Motion:** durations are `duration-fast` / `duration-base` / `duration-slow` (150 / 300 / 500ms), one easing (`ease-in-out`, the default), `transition-smooth` for multi-property transitions and `.hover-lift` / `.card-hover-glow` for the one lift. Never `transition-all`, a bare `duration-N` or `will-change-*`. Hover movement (scale, translate) is `motion-safe:` only, and JS scrolls omit `behavior: 'smooth'` so `<html>`'s `motion-safe:scroll-smooth` decides
- **Links:** a link inside a sentence uses `.link-primary` (automatic inside `.typography`): primary colour, always underlined, accent-text on hover (WCAG 1.4.1). Standalone links (back links, "View all" arrows) keep `hover:underline`
- **Fonts and toasts:** next/font variable classes go on `<html>` (root layout, global 404, global error). Sonner toasts are themed from the tokens in globals.css: pass no `theme` or colour props to `<Toaster>`. `tests/unit/css-tokens.test.ts` enforces colour tokens, radius, motion, links, fonts and toasts
- **Light only.** No dark palette, no `.dark` class, no `dark:` utilities; `:root` sets `color-scheme: light` and `body` paints `--color-background` / `--color-foreground`. `tests/unit/css-class-hygiene.test.ts` fails on any `dark:` utility in `src/` and `e2e/dark-mode-comprehensive.spec.ts` asserts pages render the same under an OS dark preference

**Component Layout:**
- Imports first (types, React, third-party, local)
- Types/interfaces, then constants (UPPER_SNAKE_CASE), then the component, then small sub-components

**Naming:**
- Components `PascalCase.tsx` · utils `kebab-case.ts` · constants `UPPER_SNAKE_CASE` · functions/vars `camelCase`

**Zod:**
- Location `src/lib/schemas/`. `common.ts` holds reusable validators (email, phone, name); feature files own form/API schemas
- Export schema and inferred type. Always `safeParse`, never `parse`

**Drizzle:**
- Schema files per-table in `src/lib/schemas/`, barrel at `schema.ts`
- TS identifiers in camelCase; columns auto-map to snake_case
- Query: `db.select().from(table).where(eq(table.col, value))`
- Sync: `bun run db:push` (drizzle-kit push). When `pg_cron` or `hypopg` are installed, push breaks — apply DDL via Neon MCP `run_sql` instead.

## TESTING

**Unit (`bun:test`):**
- Files in `tests/unit/`. Setup `tests/setup.ts` auto-mocks `@/env` and `@/lib/logger`.
- Run: `bun run test:unit` (alias for `bun test tests/`)
- Coverage: `bun run test:unit:coverage`

**E2E (Playwright):**
- Files in `e2e/`. Browsers: chromium, webkit. baseURL `http://localhost:3001`.
- Run: `bun run test:e2e` · fast: `bun run test:e2e:fast` · a11y: `bun run test:e2e:a11y`

**Coverage expectations:**
- Validation schemas: tests required
- Critical user flows: e2e required
- API routes / Server Actions: unit-test the handler

## PERFORMANCE

**Images:**
- Use Next.js `<Image>` always
- WebP only (`next.config.ts` sets `formats: ['image/webp']`)
- Specify width/height. `priority` for above-fold; lazy by default below

**Bundle:**
- `optimizePackageImports` (Next.js 16 experimental) is enabled in `next.config.ts` for Heroicons, Radix UI, Lucide, TanStack
- Aim for first-load JS under 180kB per page (aspirational; not enforced in CI)
- Dynamic-import heavy/client-only components via `next/dynamic`

## LOGGING & ANALYTICS

**Logger (`src/lib/logger.ts`):**
- Methods: `info`, `error`, `warn`, `debug`
- Never use `console.*` directly

**Analytics:**
- `@vercel/analytics` + `@vercel/speed-insights` mounted in `src/components/utilities/Analytics.tsx`
- Domain events: emit via `logger.info` with metadata

## ACCESSIBILITY

**Semantic HTML:**
- Landmarks: `main`, `nav`, `section`, `article`
- Skip-link target is `<div id="main-content">` in `src/app/layout.tsx` — note: a `<main>` landmark is not currently emitted; prefer adding one when touching the layout
- Heading hierarchy without skips

**ARIA:**
- `aria-label` on icon-only buttons
- `aria-hidden="true"` on decorative icons
- `aria-live` on dynamic content (`assertive` for errors, `polite` for info)
- `role="alert"` for errors; `role="progressbar"` + `aria-valuenow` (used in `ScrollProgress`)

**Keyboard:**
- All interactives keyboard-accessible
- Use `<button>`, never `<div onClick>`
- Visible focus states via native `:focus-visible` in globals.css

## INTEGRATIONS

**Neon + Drizzle:**
- Client `src/lib/db.ts` (lazy-init; mock when `POSTGRES_URL` is unset). Imports use the `@/` alias (`@/lib/db` -> `src/lib/db.ts`).
- Schema barrel `src/lib/schemas/schema.ts`
- Drizzle config `drizzle.config.ts` (dialect `postgresql`, `schemaFilter: ['public']`)
- `DATABASE_URL_UNPOOLED` is used by drizzle-kit for migrations
- pg_cron runs weekly VACUUM ANALYZE; see `.planning/` for details

**Blog (files, not the database):**
- Posts live in `content/blog/*.md`; authors and the tag taxonomy live in `src/lib/constants/blog.ts`
- `scripts/blog/build.ts` (`bun run blog:build`) validates every file and compiles published posts into `src/lib/_generated/blog-posts.ts` (gitignored). `dev`, `build`, `typecheck` and `test:unit` run it first. Any parse or validation error fails the build
- `src/lib/blog.ts` reads only that module: no DB, no runtime filesystem. Every post, tag and author page is prerendered at build
- Unknown post/tag/author slugs are a real HTTP 404 via `export const unstable_paramMatching = { slug: 'not-found' }` (Cache Components rejects `dynamicParams = false`; without it the `loading.tsx` shell streams a 200 soft 404)
- Publishing = merge the `.md` file; the deploy rebuilds the blog. There is no admin blog UI and no blog write API
- Scheduling: a `published: true` post with a future `publishedAt` is held out of the build until that date (UTC). `.github/workflows/publish-scheduled-posts.yml` runs daily at 11:00 UTC, runs `scripts/blog/pending.ts` against production, and POSTs the Vercel deploy hook (`VERCEL_DEPLOY_HOOK_URL` repo secret) only when a due post is not live yet, then re-checks every 30 s and fails the run if any due post is still not live after 10 minutes (GitHub emails the owner). Queue a batch by merging posts with staggered future dates
- Visual tests: `test:e2e:visual` sets `BLOG_CONTENT_DIR=tests/fixtures/blog`, so `/blog` baselines render five fixed fixture posts and never change when real posts publish
- The Neon `blog_*` tables are legacy (definitions kept in `src/lib/schemas/blog.ts` only so `drizzle-kit push` does not propose DROP TABLE)

**Auth:**
- User auth: Better Auth, session cookies, see src/lib/auth/. Admin promotion is currently SQL-only - first signup gets it; later admins via UPDATE users SET role='admin' WHERE email='...'.
- Admin/cron endpoints guarded by Bearer token (`src/lib/auth/admin.ts`) using `ADMIN_SECRET` / `CRON_SECRET`

**Resend (Email):**
- Client `src/lib/resend-client.ts`; key `RESEND_API_KEY`
- From: `noreply@hudsondigitalsolutions.com` for system mail; `hello@...` is the user-facing contact address in `src/lib/constants/business.ts`
- Senders: `src/lib/contact-service.ts`, `src/lib/scheduled-emails.ts`

**Env vars:**
- All env access goes through `src/env.ts` (T3 env). Never read `process.env.X` directly.
- Schema-required when `VERCEL_ENV === 'production'` (enforced by a `.optional().refine(...)` pair; unset elsewhere): `POSTGRES_URL`, `CSRF_SECRET`, `ADMIN_SECRET`, `CRON_SECRET`, `BETTER_AUTH_SECRET`
- Always defined (have defaults): `BASE_URL` (default `http://localhost:3000`), `NEXT_PUBLIC_BASE_URL` (default `http://localhost:3000`), `NODE_ENV` (default `development`)
- Truly optional / feature-gated: `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `STIRLING_PDF_URL`, `DISCORD_WEBHOOK_URL`, `SLACK_WEBHOOK_URL`, `GOOGLE_SITE_VERIFICATION`, `DATABASE_URL_UNPOOLED`, `NEXT_PUBLIC_SITE_URL`

## DEVELOPMENT COMMANDS

- `bun run dev` — dev server
- `bun run build` — production build (`next build --webpack`)
- `bun run start` — production server
- `bun run lint` / `lint:fix` — Biome check / autofix
- `bun run typecheck` — `tsc --noEmit`
- `bun run test:unit` / `test:unit:coverage` — bun:test
- `bun run test:e2e` / `test:e2e:fast` / `test:e2e:a11y` — Playwright variants
- `bun run test:all` — lint + typecheck + unit + e2e:fast
- `bun run db:push` — Drizzle schema sync (Neon)

The aggregate scripts (`test:all`, `test:ci`, `test:unit`) invoke nested bun via `command bun` so they bypass shell-function wrappers (e.g. Aikido safe-chain) that some shells inject through `BASH_ENV`. Without it, doubly-nested `bun run` chains crash with a pkg re-entry error (`Cannot find module 'bun'`). `command bun` is a no-op where no wrapper exists (clean shells, CI).

## GIT WORKFLOW

**Before commit:**
- `bun run lint && bun run typecheck` must pass
- Lefthook is installed via the `prepare` script — its pre-commit hooks must pass

**Commit format:**
- First line `type: description` (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`); under 50 chars
- Blank line, then bullet body explaining WHY, not WHAT

## WHEN IN DOUBT

- Choose simplicity over cleverness
- Use native platform features over custom solutions
- Delete code rather than add when possible
- Search the codebase before implementing
- Ask the user when requirements are unclear
- Follow existing patterns
- Prioritize type safety and accessibility
- This is production code, not a demo
