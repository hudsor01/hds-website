# Technology Stack

**Analysis Date:** 2026-01-10
**Last Updated:** 2026-03-16

## Languages

**Primary:**
- TypeScript 5.x - All application code (strict mode)

**Secondary:**
- JavaScript (ESNext) - Build scripts, configuration files

## Runtime

**Environment:**
- Node.js 20.x (via Bun runtime)
- Next.js 15+ server runtime

**Package Manager:**
- Bun 1.3.8

## Frameworks

**Core:**
- Next.js 15+ - Full-stack React framework with App Router
- React 19 - UI library
- React DOM 19 - Browser rendering

**Testing:**
- Playwright - E2E testing (chromium, firefox, webkit)
- Bun test (native) - Unit testing via `bun test` command
- @testing-library/react - React component testing

**Build/Dev:**
- TypeScript - Type checking and compilation (strict mode)
- Tailwind CSS 4 - Utility-first CSS framework
- PostCSS - CSS processing with @tailwindcss/postcss plugin
- Biome 2.4.4 - Sole linter and formatter (replaced ESLint + Prettier)

## Key Dependencies

**Critical:**
- @neondatabase/serverless - Neon PostgreSQL connection
- drizzle-orm - Type-safe ORM with Neon HTTP adapter
- Zod - Runtime validation and type inference
- Resend - Email delivery service

**UI Components:**
- Radix UI - Accessible headless components
- Lucide React - Icon library
- class-variance-authority - Component variant styling (CVA)
- tailwind-merge - Tailwind class merging utility

**PDF Generation:**
- @react-pdf/renderer - PDF templates
- Puppeteer - Headless browser for PDF generation

**Infrastructure:**
- @vercel/analytics - Web analytics
- @vercel/speed-insights - Performance monitoring
- @t3-oss/env-nextjs - Type-safe environment variables

## Configuration

**Environment:**
- Type-safe environment variables via @t3-oss/env-nextjs (`src/env.ts`)
- Validated with Zod schemas on startup
- `.env.local` for local development (gitignored)

**Build:**
- `tsconfig.json` - TypeScript compiler with strict mode, path aliases (@/*)
- `next.config.ts` - Next.js configuration with WebP optimization
- `postcss.config.mjs` - PostCSS with Tailwind plugin
- `biome.json` - Biome linting and formatting rules
- `playwright.config.ts` - E2E test configuration
- `bunfig.toml` - Bun test runner configuration (happy-dom environment)
- `drizzle.config.ts` - Drizzle ORM configuration for Neon

## Platform Requirements

**Development:**
- macOS/Linux/Windows (any platform with Bun runtime)
- Bun 1.3.8 or compatible

**Production:**
- Vercel platform for hosting and deployment
- Neon PostgreSQL for database
- Serverless functions (Next.js API routes)
- Automatic deployments on main branch push

---

*Stack analysis: 2026-01-10*
*Updated: 2026-03-16 — reflects current Neon/Drizzle/Biome stack*
