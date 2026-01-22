# Project overview

- Purpose: Hudson Digital Solutions business website (Next.js App Router) with SEO, contact form, email automation, and performance monitoring.
- Stack: Next.js 16, React 19, TypeScript (strict), Tailwind CSS v4, Radix UI, class-variance-authority, Zod, Drizzle ORM, Playwright, Bun test runner.
- Structure:
  - src/app/ (App Router pages, layouts, API routes, server actions)
  - src/components/ (layout, forms, ui, feature components)
  - src/lib/ (core utilities like logger, analytics, seo-utils)
  - src/lib/schemas/ (Zod schemas)
  - src/types/ and src/hooks/
  - public/ (static assets)
  - scripts/ (sitemap, env validation, image optimization)
  - tests/ (Bun unit tests)
  - e2e/ (Playwright specs)
- Env: .env.local from .env.example; required RESEND_API_KEY; optional CSRF_SECRET, CRON_SECRET, DATABASE_URL, NEON_AUTH_BASE_URL.