# Hudson Digital Solutions Website

Source for hudsondigitalsolutions.com: the marketing site, free business tools, the blog, and a small admin area for leads and content.

## Stack

- **Next.js 16** (App Router, Cache Components) + **React 19**, TypeScript strict
- **Bun** 1.3 as runtime and package manager (`bun.lock`)
- **Tailwind CSS v4**, tokens and utilities in `src/app/globals.css`. Light theme only, no dark mode
- **Biome** for lint and format (`biome.json`), **Lefthook** for git hooks
- **Neon Postgres** + **Drizzle ORM** (`src/lib/db.ts`, schemas in `src/lib/schemas/`)
- **Better Auth** sessions (`src/lib/auth/`); the admin area requires `role = 'admin'`
- **Resend** + react-email for mail (`src/lib/resend-client.ts`, templates in `src/emails/`)
- **Zod 4** validation, `@tanstack/react-form` forms, Sonner toasts
- **@t3-oss/env-nextjs** typed env in `src/env.ts`
- `bun:test` unit tests, Playwright e2e
- Hosted on **Vercel**

## Setup

```bash
git clone https://github.com/hudsor01/hds-website.git
cd hds-website
bun install
vercel env pull .env.local   # or create .env.local by hand
bun run dev
```

`bun install` runs the `prepare` script, which installs the Lefthook hooks and regenerates `src/lib/_generated/brand.ts` from `globals.css`. The dev server runs at http://localhost:3000. Every variable is optional outside Vercel production, so the site starts with an empty `.env.local`; without `POSTGRES_URL` the database client returns empty results.

## Scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Build blog content, start the dev server |
| `bun run build` | Build blog content, then `next build --webpack` |
| `bun run start` | Serve the production build |
| `bun run lint` / `lint:fix` / `format` | Biome check, autofix, format |
| `bun run typecheck` | Build blog content, then `tsc --noEmit` |
| `bun run test:unit` | Mock-leak check, blog build, `bun test tests/` |
| `bun run test:unit:coverage` / `test:unit:watch` / `test:unit:random` | Unit test variants |
| `bun run test:e2e` | Playwright, chromium and webkit |
| `bun run test:e2e:fast` | Playwright, chromium only, one worker |
| `bun run test:e2e:a11y` | Tests tagged `@accessibility` |
| `bun run test:e2e:visual` | Visual baselines (`@visual`) against fixture blog posts |
| `bun run test:all` | Lint, typecheck, unit, `test:e2e:fast` |
| `bun run blog:build` / `blog:validate` / `blog:links` | Compile posts, run the content guardrails, report inbound links |
| `bun run db:push` | Drizzle schema sync |
| `bun run clean` | Remove `.next`, `out` and test reports |

Playwright starts its own dev server on port 3001 (`playwright.config.ts`).

## Project structure

```
content/blog/       Blog posts, one Markdown file each
drizzle/            SQL migrations
e2e/                Playwright specs
public/             Static files (icons, fonts, images, manifest)
scripts/            Blog pipeline, brand tokens, GSC report, test helpers, SQL one-offs
src/
  app/              App Router: (public), (landing), (auth), (admin) route groups, api/ routes, sitemaps, llms.txt
  components/       UI primitives, layout, forms, blog, tools, admin
  data/             Static JSON (form options, pay dates, states)
  emails/           react-email templates
  hooks/            React hooks (form factory, paystub, uploads)
  lib/              Server and shared logic, schemas, constants
  providers/        React Query provider
  stores/           Zustand calculator store
  types/            Shared types
  env.ts            Typed environment variables
  proxy.ts          Security headers, UA blocklist, CORS, /admin cookie gate
tests/              bun:test suites (most in tests/unit/), fixtures
```

## Blog

Posts are Markdown files in `content/blog/`. There is no blog database or admin editor.

- `scripts/blog/build.ts` validates every file and compiles published posts into `src/lib/_generated/blog-posts.ts` (gitignored). `dev`, `build`, `typecheck` and `test:unit` run it first, and any validation error fails the build.
- Publishing is merging the file. A post with `published: true` and a future `publishedAt` stays out of the build until that date (UTC).
- `.github/workflows/publish-scheduled-posts.yml` runs daily at 11:00 UTC and triggers a Vercel deploy when a due post is not live yet.
- Authors and tags are defined in `src/lib/constants/blog.ts`.

## Contact form and email

The form posts to `/api/contact`, which runs CSRF and rate-limit guards, validates with Zod, saves the lead and its attribution, and scores it. When `RESEND_API_KEY` is set it then sends an admin notification, a welcome email to the submitter and Slack/Discord alerts for high-value leads (when the webhook URLs are set). Higher-intent leads also get one follow-up email three days later, queued in the database and sent by the `/api/process-emails` cron (daily at 00:00 UTC, `vercel.json`).

## Security and SEO

- Security headers and the CSP are set in `src/proxy.ts` (CSP built in `src/lib/security-headers.ts`), not in `vercel.json`. CSRF and rate limiting are per route via `withMutationGuards` in `src/lib/api/guards.ts`.
- `sitemap.xml` is an index over `sitemap-core.xml`, `sitemap-services.xml`, `sitemap-locations.xml` and `sitemap-blog.xml`. `robots.ts`, `llms.txt`, Open Graph and Twitter images are generated in `src/app/`.
- Structured data is rendered with `<JsonLd />` from helpers in `src/lib/seo-utils.ts`.

## Analytics and monitoring

- Vercel Analytics and Speed Insights, mounted in `src/app/layout.tsx`.
- `WebVitalsReporting` sends Web Vitals from `next/web-vitals` to `/api/web-vitals` in production.
- `AttributionTracker` records UTM parameters, ad click IDs, referrer and landing page, saved with each lead.
- Sentry is off by default: server init (`src/instrumentation.ts`) needs `SENTRY_DSN`, browser init (`src/instrumentation-client.ts`) needs `NEXT_PUBLIC_SENTRY_DSN`. Set both together, because the browser SDK reports through the `/monitoring` tunnel that `next.config.ts` adds only when a DSN is set at build.

## Environment variables

`src/env.ts` defines and validates every variable. A variable that is present but invalid stops the app at startup.

**Required when `VERCEL_ENV=production`** (optional elsewhere): `POSTGRES_URL`, `CSRF_SECRET`, `ADMIN_SECRET`, `CRON_SECRET`, `BETTER_AUTH_SECRET`. The four secrets must be at least 32 characters.

**Optional:**
- `DATABASE_URL_UNPOOLED` - direct connection for drizzle-kit
- `RESEND_API_KEY` - email delivery
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` - shared rate limiting
- `SLACK_WEBHOOK_URL`, `DISCORD_WEBHOOK_URL` - lead alerts
- `BETTER_AUTH_URL`, `BETTER_AUTH_TRUSTED_ORIGINS` - auth URL overrides
- `BLOB_READ_WRITE_TOKEN` - admin image uploads (Vercel Blob)
- `PAGESPEED_API_KEY` - PageSpeed Insights quota for the performance tool
- `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` - error monitoring (`SENTRY_ORG` and `SENTRY_PROJECT` are read at build by `next.config.ts`)
- `GOOGLE_ADS_CUSTOMER_ID`, `GOOGLE_ADS_CONVERSION_ACTION_ID`, `GOOGLE_ADS_SALE_CONVERSION_ACTION_ID`, `GOOGLE_ADS_LOGIN_CUSTOMER_ID`, `GOOGLE_ADS_SA_JSON` - offline conversion upload
- `GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_SITE_URL`, `VERCEL_REGION`

`BASE_URL` and `NEXT_PUBLIC_BASE_URL` default to `http://localhost:3000`.

## Deployment

The site deploys on Vercel from GitHub. `vercel.json` sets the Bun install and build commands, RSS rewrites (`/rss`, `/feed`, `/rss.xml` and others to `/api/rss/feed`), two permanent redirects, the daily email cron and the `iad1` region. GitHub Actions CI (`.github/workflows/ci.yml`) runs on pushes and pull requests to `main` and `develop`. Its jobs run the test mock-leak check, lint, typecheck, blog validation, a brand-token check, fallow, unit tests, a production build, the Chromium Playwright functional suite (`test:e2e:ci`, `@visual` excluded) and the visual regression suite (`test:e2e:visual`).

## License

All rights reserved - Hudson Digital Solutions
