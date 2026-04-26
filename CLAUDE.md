# CLAUDE.md

**NO EMOJIS** - Never use emojis unless explicitly requested. Use Heroicons/Lucide React for UI icons.
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
- **Lint / Format**: Biome 2.4.4 (`biome.json`)
- **DB**: Neon Postgres + Drizzle ORM 0.45 — client `src/lib/db.ts`, schema barrel `src/lib/schemas/schema.ts`
- **Forms**: `@tanstack/react-form` via factory in `src/hooks/form-hook.tsx`
- **Validation**: Zod 4
- **Toasts**: Sonner (no custom provider)
- **Email**: Resend (`src/lib/resend-client.ts`)
- **Tests**: `bun:test` for unit, Playwright for e2e
- **Env**: `@t3-oss/env-nextjs` — typed env in `src/env.ts`. Never read `process.env.X` directly.

## FILE ORGANIZATION

- `src/app/` - App Router pages, layouts, API route handlers
- `src/app/actions/` - Server Actions (currently: `ttl-calculator.ts`)
- `src/app/api/` - API routes (blog, calculators, contact, csp-reports, health, newsletter, pagespeed, process-emails, rss, testimonials, web-vitals)
- `src/components/layout/` - `Navbar.tsx` (exported as `NavbarLight`), `Footer.tsx`
- `src/components/forms/` - `ContactForm`, `NewsletterSignup`, `FormField`, `FormSuccessMessage`
- `src/components/ui/` - Base primitives (button, card, input, label)
- `src/components/utilities/` - Cross-cutting components (`Icon`/`IconButton`, `Analytics`, `JsonLd`, `ScrollProgress`)
- `src/lib/` - Core utilities (partial: `db`, `logger`, `errors`, `analytics`, `seo-utils`, `csrf`, `rate-limiter`, `resend-client`, `contact-service`, `scheduled-emails`, `email-utils`, `notifications`, `request`, `security-headers`, `attribution`, plus per-domain modules `blog`, `showcase`, `testimonials`, `help-articles`, `paystub-calculator/`, `pdf/`, `ttl-calculator/`)
- `src/lib/auth/admin.ts` - Bearer-token guard for admin/cron endpoints (no user auth in this app)
- `src/lib/schemas/` - Drizzle table schemas + Zod schemas; barrel at `schema.ts`
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
- Two independent `castError` helpers exist: `src/lib/errors.ts` returns `Error`, `src/lib/logger.ts` returns `ErrorLogData`. Pick the one whose return type matches the call site.
- Wrap async ops in try/catch
- Log via `logger.error` — never `console.*`
- Return user-friendly messages; never expose internals

**Tailwind v4 / Styling:**
- Defined in `src/app/globals.css` via `@utility` blocks and class rules
- Available: `.glass-card`, `.glass-card-light`, `.hover-lift`, `.transition-smooth`, `.section-spacing`, `.card-padding` (`-sm` / `-lg` variants)
- Focus styling is native via `:focus-visible` in globals.css — there is no `.focus-ring` class
- Use CSS custom properties, not hard-coded values

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

**Auth:**
- No user-auth system in this app
- Admin/cron endpoints guarded by Bearer token (`src/lib/auth/admin.ts`) using `ADMIN_SECRET` / `CRON_SECRET`

**Resend (Email):**
- Client `src/lib/resend-client.ts`; key `RESEND_API_KEY`
- From: `noreply@hudsondigitalsolutions.com` for system mail; `hello@...` is the user-facing contact address in `src/lib/constants/business.ts`
- Senders: `src/lib/contact-service.ts`, `src/lib/scheduled-emails.ts`

**Env vars:**
- All env access goes through `src/env.ts` (T3 env). Never read `process.env.X` directly.
- Schema-required when `VERCEL_ENV === 'production'` (enforced by a `.optional().refine(...)` pair; unset elsewhere): `POSTGRES_URL`, `CSRF_SECRET`, `ADMIN_SECRET`, `CRON_SECRET`
- Always defined (have defaults): `BASE_URL` (default `http://localhost:3000`), `NEXT_PUBLIC_BASE_URL` (default `http://localhost:3000`), `NODE_ENV` (default `development`)
- Truly optional / feature-gated: `RESEND_API_KEY`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `STIRLING_PDF_URL`, `DISCORD_WEBHOOK_URL`, `SLACK_WEBHOOK_URL`, `GOOGLE_SITE_VERIFICATION`, `DATABASE_URL_UNPOOLED`, `NEXT_PUBLIC_SITE_URL`

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
