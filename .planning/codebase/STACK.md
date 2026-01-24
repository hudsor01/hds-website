# Technology Stack

**Analysis Date:** 2026-01-10

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code (`package.json`)

**Secondary:**
- JavaScript (ESNext) - Build scripts, configuration files (`tsconfig.json` target: ESNext)

## Runtime

**Environment:**
- Node.js 20.x (via Bun 1.3.4 runtime) - `package.json`
- Next.js 16.1.1 server runtime

**Package Manager:**
- Bun 1.3.4 - `package.json` line 129: `"packageManager": "bun@1.3.4"`
- Lockfile: `package-lock.json` present (npm fallback)

## Frameworks

**Core:**
- Next.js 16.1.1 - Full-stack React framework with App Router (`package.json`)
- React 19.2.3 - UI library (`package.json`)
- React DOM 19.2.3 - Browser rendering (`package.json`)

**Testing:**
- Playwright 1.57.0 - E2E testing (`package.json`)
- Bun test (native) - Unit testing via `bun test` command
- @testing-library/react 16.3.1 - React component testing (`package.json`)

**Build/Dev:**
- TypeScript 5.9.3 - Type checking and compilation (`package.json`)
- Tailwind CSS 4.1.18 - Utility-first CSS framework (`package.json`)
- PostCSS 8.5.6 - CSS processing with @tailwindcss/postcss plugin (`postcss.config.mjs`)
- ESLint 9.39.2 - Code linting (`package.json`)
- Prettier 3.7.4 - Code formatting (`package.json`)

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.90.1 - Database and authentication (`package.json`)
- @supabase/ssr 0.8.0 - Server-side rendering for Supabase auth (`package.json`)
- Zod 4.1.13 - Runtime validation and type inference (`package.json`)
- Resend 6.6.0 - Email delivery service (`package.json`)

**State Management:**
- Zustand 5.0.9 - Client state management (`package.json`)
- TanStack React Query 5.90.16 - Server state & caching (`package.json`)
- TanStack React Form 1.27.7 - Form state management (`package.json`)

**UI Components:**
- Radix UI (10+ components) - Accessible headless components (`package.json`)
- Lucide React 0.561.0 - Icon library (`package.json`)
- class-variance-authority 0.7.1 - Component variant styling (`package.json`)
- tailwind-merge 3.4.0 - Tailwind class merging utility (`package.json`)

**PDF Generation:**
- @react-pdf/renderer 4.3.2 - PDF templates (`package.json`, `src/lib/pdf/`)
- Puppeteer 24.34.0 - Headless browser for PDF generation (`package.json`, `src/lib/pdf/generator.ts`)

**Infrastructure:**
- @vercel/analytics 1.6.1 - Web analytics (`package.json`)
- @vercel/speed-insights 1.3.1 - Performance monitoring (`package.json`)
- @vercel/kv 3.0.0 - Distributed key-value storage (rate limiting) (`package.json`, `src/lib/rate-limiter.ts`)

## Configuration

**Environment:**
- Type-safe environment variables via @t3-oss/env-nextjs 0.13.10 (`src/env.ts`)
- Validated with Zod schemas on startup
- Separate server/client environment variable namespaces
- `.env.local` for local development (gitignored)

**Build:**
- `tsconfig.json` - TypeScript compiler with strict mode, path aliases (@/*)
- `next.config.ts` - Next.js configuration with WebP optimization
- `postcss.config.mjs` - PostCSS with Tailwind plugin
- `eslint.config.mjs` - ESLint rules (no-any, consistent-type-imports)
- `.prettierrc.json` - Code formatting (tabs, no semi, single quotes)
- `playwright.config.ts` - E2E test configuration
- `bunfig.toml` - Bun test runner configuration (happy-dom environment)

## Platform Requirements

**Development:**
- macOS/Linux/Windows (any platform with Bun runtime)
- Bun 1.3.4 or compatible Node.js version
- No additional tooling required (Bun handles everything)

**Production:**
- Vercel platform for hosting and deployment
- Serverless functions (Next.js API routes)
- Edge runtime compatible
- Automatic deployments on main branch push

---

*Stack analysis: 2026-01-10*
*Update after major dependency changes*
