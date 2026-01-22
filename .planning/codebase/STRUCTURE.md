# Directory Structure

**Analysis Date:** 2026-01-10

## Directory Layout

```
business-website/
├── src/
│   ├── app/                    # Next.js 16 App Router
│   │   ├── (tools)/           # Route group (URL: /paystub not /tools/paystub)
│   │   │   ├── paystub/       # Paystub generator tool
│   │   │   ├── invoice/       # Invoice generator tool
│   │   │   ├── timesheet/     # Timesheet tracker tool
│   │   │   └── layout.tsx     # Shared layout for tools
│   │   ├── actions/           # Server Actions (marked 'use server')
│   │   ├── api/               # API route handlers
│   │   │   └── contact/       # Contact form submission endpoint
│   │   ├── layout.tsx         # Root layout (metadata, providers)
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles, Tailwind utilities
│   ├── components/            # Reusable React components
│   │   ├── forms/             # Form-specific components
│   │   ├── layout/            # Layout components (Navbar, Footer)
│   │   └── ui/                # Base UI components (Button, Input, etc.)
│   ├── lib/                   # Core utilities and business logic
│   │   ├── email/             # Email integration (Resend)
│   │   ├── pdf/               # PDF generation (Puppeteer)
│   │   ├── schemas/           # Zod validation schemas
│   │   ├── schema/            # Drizzle ORM schema definitions
│   │   ├── auth/              # Neon Auth client utilities
│   │   ├── analytics.ts       # Analytics wrapper
│   │   ├── logger.ts          # Logging utility
│   │   ├── rate-limiter.ts    # Rate limiting (Vercel KV)
│   │   └── seo-utils.ts       # SEO helpers, structured data
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Framework-specific utilities
│   │   └── errors.ts          # Error handling helpers
│   └── env.ts                 # Environment variable validation
├── public/                    # Static assets (images, fonts, icons)
├── tests/                     # Unit tests (Vitest)
│   └── unit/
├── e2e/                       # End-to-end tests (Playwright)
├── .planning/                 # Project planning documents
│   └── codebase/             # Codebase documentation
├── bunfig.toml               # Bun configuration
├── next.config.ts            # Next.js configuration
├── playwright.config.ts      # Playwright test configuration
├── postcss.config.mjs        # PostCSS configuration (Tailwind)
├── prettier.config.js        # Prettier formatting rules
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## Key Locations

**Application Code:**
- `src/app/` - Next.js routing, pages, layouts, API routes
- `src/components/` - Reusable React components
- `src/lib/` - Business logic, utilities, schemas
- `src/utils/` - Framework integrations

**Configuration:**
- Root level - Framework configs (Next.js, TypeScript, Tailwind, etc.)
- `src/env.ts` - Type-safe environment variables

**Testing:**
- `tests/unit/` - Vitest unit tests
- `e2e/` - Playwright E2E tests

**Documentation:**
- `.planning/codebase/` - Codebase analysis documents
- `CLAUDE.md` - Project-specific AI assistant instructions
- `README.md` - Project overview, setup instructions

**Static Assets:**
- `public/` - Images, fonts, icons, favicon
- `public/images/` - WebP optimized images

## Organization Principles

**Route Groups:**
- Pattern: `app/(group-name)/feature/`
- Purpose: Logical grouping without affecting URL structure
- Example: `app/(tools)/paystub/` → URL is `/paystub` not `/tools/paystub`
- Benefits: Shared layouts without URL nesting

**Component Organization:**
- `components/layout/` - Layout components (Navbar, Footer, Header)
- `components/forms/` - Form-specific components (ContactForm, SubmitButton)
- `components/ui/` - Base reusable components (Button, Input, Card)
- `components/[feature]/` - Feature-specific components when needed
- Root `components/` - Shared components used across features

**Library Organization:**
- `lib/schemas/` - Zod validation schemas (domain-specific)
- `lib/email/` - Email service integration
- `lib/pdf/` - PDF generation utilities
- `lib/schema/` - Drizzle ORM schema definitions
- `lib/auth/` - Neon Auth client utilities
- `lib/db.ts` - Drizzle database client
- Root `lib/` - General utilities (logger, analytics, SEO)

**Type Organization:**
- `types/` - Shared TypeScript type definitions
- Co-located types - Types specific to a component/module
- Inferred types - Types derived from Zod schemas

**Test Organization:**
- `tests/unit/` - Unit tests mirroring `src/` structure
- `e2e/` - End-to-end tests by user flow
- Co-located tests - `*.test.ts` alongside source (optional pattern)

## Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (ContactForm.tsx, CTAButton.tsx)
- Utilities: `kebab-case.ts` (seo-utils.ts, rate-limiter.ts)
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx` (Next.js convention)
- API routes: `route.ts` (Next.js convention)
- Tests: `*.test.ts` or `*.spec.ts`

**Directories:**
- Features: `kebab-case` (paystub, invoice, timesheet)
- Route groups: `(group-name)` with parentheses
- Components: `kebab-case` or feature name
- Multiple words: `kebab-case` (contact-form, user-settings)

**Constants:**
- Global constants: `UPPER_SNAKE_CASE` (MAX_FILE_SIZE, API_TIMEOUT)
- Location: Top of file or dedicated constants file
- Exported: When shared across modules

**Functions:**
- Utility functions: `camelCase` (formatDate, calculateTotal)
- Server Actions: `camelCase` with descriptive names (submitContactForm)
- React components: `PascalCase` (ContactForm, SubmitButton)

## Module Structure

**Typical Page Module:**
```
src/app/feature/
├── page.tsx          # Page component (Server Component)
├── layout.tsx        # Optional layout for nested routes
└── loading.tsx       # Optional loading state
```

**Typical Feature Module:**
```
src/components/feature/
├── FeatureComponent.tsx     # Main component
├── FeatureForm.tsx          # Form component if needed
└── feature-utils.ts         # Feature-specific utilities
```

**Typical Utility Module:**
```
src/lib/feature/
├── index.ts                 # Public API exports
├── feature-service.ts       # Core logic
├── feature-types.ts         # Type definitions
└── feature-schema.ts        # Validation schema
```

## Import Paths

**Path Aliases:**
- `@/*` → `src/*` (configured in `tsconfig.json`)
- Example: `import { logger } from '@/lib/logger'`
- Benefits: Cleaner imports, refactoring resilience

**Import Order:**
1. Types (import type)
2. React and third-party packages
3. Local modules (using @ alias)
4. Relative imports (if needed)
5. Styles

**Example:**
```typescript
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ContactForm } from '@/components/forms/ContactForm'
import { logger } from '@/lib/logger'
import './styles.css'
```

## Build Output

**Production Build:**
- `.next/` - Next.js build output (gitignored)
- `.next/standalone/` - Standalone server deployment
- `.next/static/` - Static assets for CDN

**Development:**
- `.next/cache/` - Build cache for faster rebuilds
- `node_modules/` - Dependencies (managed by Bun)

## Ignored Files

**Version Control (.gitignore):**
- `.next/` - Build output
- `node_modules/` - Dependencies
- `.env*.local` - Local environment variables
- `*.log` - Log files
- `.DS_Store` - macOS system files

**Not Ignored:**
- `.env.example` - Template for required environment variables
- `package-lock.json` - Lockfile for npm fallback
- `.prettierrc.json` - Formatting configuration
- `.planning/` - Planning documents (versioned)

---

*Structure analysis: 2026-01-10*
*Update after significant reorganization*
