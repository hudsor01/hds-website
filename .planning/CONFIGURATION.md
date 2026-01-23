# Configuration Documentation

Complete reference for all configuration files in the Hudson Digital Solutions website project.

---

## Table of Contents

1. [Next.js Configuration](#nextjs-configuration)
2. [TypeScript Configuration](#typescript-configuration)
3. [Tailwind CSS Configuration](#tailwind-css-configuration)
4. [PostCSS Configuration](#postcss-configuration)
5. [ESLint Configuration](#eslint-configuration)
6. [Playwright Configuration](#playwright-configuration)
7. [Sitemap Configuration](#sitemap-configuration)
8. [Vercel Deployment](#vercel-deployment)
9. [Package Scripts](#package-scripts)
10. [Environment Variables](#environment-variables)

---

## Next.js Configuration

**File:** `next.config.ts`

Minimal Next.js configuration focused on performance and security.

### Key Settings

```typescript
const nextConfig: NextConfig = {
  compress: true,                      // Enable gzip compression
  poweredByHeader: false,              // Security: hide X-Powered-By header
  reactStrictMode: true,               // Enable strict mode for development
  experimental: {
    optimizePackageImports: [          // Tree-shake icon libraries
      'lucide-react',
      '@radix-ui/react-icons'
    ]
  },
  images: {
    formats: ['image/webp'],           // Modern image format
    remotePatterns: [...],             // Allow Supabase images
  }
};
```

### Image Optimization

- **Format:** WebP only (smaller file sizes)
- **Remote Patterns:** Supabase storage domains allowed for user-uploaded content

### Headers

Security headers applied to all routes:
- `X-DNS-Prefetch-Control: on` - Enable DNS prefetching
- `X-Frame-Options: SAMEORIGIN` - Prevent clickjacking
- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Privacy protection

---

## TypeScript Configuration

**File:** `tsconfig.json`

Strict TypeScript configuration with Next.js optimizations.

### Compiler Options

```json
{
  "strict": true,                      // Enable all strict type checks
  "noUncheckedIndexedAccess": true,    // Index signatures return T | undefined
  "skipLibCheck": true,                // Skip type checking of declaration files
  "esModuleInterop": true,             // Better CommonJS/ESM compatibility
  "moduleResolution": "Bundler",       // Modern module resolution
  "jsx": "preserve",                   // Let Next.js handle JSX transform
  "incremental": true,                 // Faster subsequent builds
  "plugins": [{ "name": "next" }]      // Next.js TypeScript plugin
}
```

### Path Aliases

```typescript
"@/*": ["./src/*"]                     // Import from src/ with @/
```

**Example Usage:**
```typescript
import { Button } from '@/components/ui/button';
import { env } from '@/env';
```

### Include/Exclude

- **Included:** `next-env.d.ts`, all `.ts/.tsx` files, `.next/types/**/*.ts`
- **Excluded:** `node_modules`, build outputs

---

## Tailwind CSS Configuration

**File:** `src/app/globals.css` (Tailwind v4)

Tailwind CSS v4 uses CSS-based configuration instead of JavaScript config files.

### Theme Configuration

Located in `@theme {}` directive in globals.css:

```css
@theme {
  /* Semantic color tokens using OKLCH color space */
  --color-primary: oklch(0.50 0.14 240);        /* Professional blue */
  --color-accent: oklch(0.60 0.15 50);          /* Orange accent */
  --color-success: oklch(0.55 0.16 145);        /* Green */
  --color-warning: oklch(0.75 0.15 85);         /* Yellow */
  --color-destructive: oklch(0.50 0.22 25);     /* Red */
}
```

### Source Patterns

Tailwind scans these paths for class usage:

```css
@source "../**/*.{ts,tsx}";              /* All app directory components */
@source "../../components/**/*.{ts,tsx}"; /* All components */
```

### Color System

- **Format:** OKLCH (perceptually uniform color space)
- **Tokens:** Semantic names (primary, accent, success, warning, destructive)
- **Dark Mode:** CSS variables automatically adapt
- **Variants:** Light, muted, text, dark, darker, bg-dark for each semantic color

### Spacing Utilities

Custom spacing tokens for consistent layout:

```css
--spacing-tight: 0.25rem;          /* 4px - minimal spacing */
--spacing-subheading: 0.5rem;      /* 8px - between heading and content */
--spacing-content: 1rem;           /* 16px - general content spacing */
--spacing-comfortable: 1.5rem;     /* 24px - relaxed spacing */
--spacing-section: 2rem;           /* 32px - major section spacing */
--spacing-heading: 3rem;           /* 48px - between major sections */
```

**Usage:**
```tsx
<div className="space-y-content">      {/* 1rem vertical spacing */}
<div className="mt-heading">           {/* 3rem top margin */}
```

---

## PostCSS Configuration

**File:** `postcss.config.mjs`

Minimal PostCSS configuration for Tailwind v4.

```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},        // Tailwind v4 PostCSS plugin
  },
};
```

**Note:** Tailwind v4 uses a single PostCSS plugin instead of the previous autoprefixer + tailwindcss setup.

---

## ESLint Configuration

**File:** `eslint.config.mjs`

Comprehensive linting rules enforcing code quality and type safety.

### Extends

- `eslint-config-next/core-web-vitals` - Next.js recommended rules
- `eslint-config-next/typescript` - TypeScript integration

### Key Rules

#### TypeScript Rules

```javascript
'@typescript-eslint/no-unused-vars': 'error',          // No unused variables
'@typescript-eslint/consistent-type-imports': 'error', // Use type imports
'@typescript-eslint/no-explicit-any': 'error',         // No any types
'@typescript-eslint/no-non-null-assertion': 'warn',    // Avoid ! operator
```

**Pattern:**
```typescript
import type { User } from '@/types';  // ✅ type import
import { User } from '@/types';       // ❌ value import for types
```

#### Code Quality Rules

```javascript
'no-console': 'warn',                  // Use logger instead
'no-debugger': 'error',                // No debugger statements
'prefer-const': 'error',               // Use const when possible
'eqeqeq': ['error', 'always'],        // Require === and !==
'curly': ['error', 'all'],            // Require braces for all blocks
'no-duplicate-imports': 'error',       // No duplicate imports
```

#### React Rules

```javascript
'react/no-unescaped-entities': 'off',        // Allow ' in JSX
'react-hooks/set-state-in-effect': 'error',  // Prevent infinite loops
```

### Ignored Paths

- `.next/**` - Next.js build output
- `coverage/**` - Test coverage reports
- `playwright-report/**` - E2E test reports
- `e2e/**` - E2E test files (tested separately)

---

## Playwright Configuration

**File:** `playwright.config.ts`

End-to-end testing configuration with multi-browser support.

### Test Settings

```typescript
{
  testDir: './e2e',                    // E2E test directory
  testIgnore: '**/api/**',             // Skip API test folders
  fullyParallel: true,                 // Run tests in parallel
  workers: 1,                          // Single worker for stability
  retries: process.env.CI ? 2 : 0,     // Retry in CI only
  reporter: 'html',                    // HTML test report
}
```

### Browser Projects

Tests run on 3 browser engines:

1. **Chromium** - Chrome, Edge, Brave
2. **Firefox** - Mozilla Firefox
3. **WebKit** - Safari

### Base Configuration

```typescript
use: {
  baseURL: 'http://localhost:3001',   // Test server port
  trace: 'on-first-retry',             // Capture trace on failure
  storageState: undefined,             // Clear state between tests
  actionTimeout: 10000,                // 10s per action
  navigationTimeout: 30000,            // 30s for page loads
}
```

### Web Server

Auto-starts dev server for tests:

```typescript
webServer: {
  command: 'bun run dev -- -p 3001',
  url: 'http://localhost:3001',
  reuseExistingServer: !process.env.CI,
}
```

**Note:** Uses port 3001 to avoid conflicts with main dev server (3000)

---

## Sitemap Configuration

**File:** `next-sitemap.config.js`

SEO sitemap generation with custom priorities.

### Basic Settings

```javascript
{
  siteUrl: env.NEXT_PUBLIC_SITE_URL,   // From typed env
  generateRobotsTxt: true,             // Generate robots.txt
  generateIndexSitemap: false,         // Single sitemap (small site)
  changefreq: 'weekly',                // Default change frequency
  priority: 0.7,                       // Default priority
  sitemapSize: 5000,                   // Max URLs per sitemap
}
```

### Excluded Routes

```javascript
exclude: [
  '/api/*',              // All API routes
  '/server-sitemap.xml', // Dynamic sitemap
  '/404',                // Error pages
  '/500',
]
```

### Custom Priorities

```javascript
const priorities = {
  '/': 1.0,              // Homepage (highest)
  '/contact': 0.9,       // Contact page
  '/services': 0.8,      // Services
  '/about': 0.7,         // About
  '/blog': 0.6,          // Blog
};
```

### robots.txt Configuration

```javascript
robotsTxtOptions: {
  policies: [{
    userAgent: '*',
    allow: '/',
    disallow: ['/api'],  // Block API routes from crawlers
  }],
  additionalSitemaps: [
    'https://hudsondigitalsolutions.com/server-sitemap.xml',
  ],
}
```

---

## Vercel Deployment

**File:** `vercel.json`

Production deployment configuration for Vercel platform.

### Framework Settings

```json
{
  "framework": "nextjs",
  "bunVersion": "1.3.4",                          // Bun runtime version
  "installCommand": "bun install --frozen-lockfile",
  "buildCommand": "bun run build",
}
```

### URL Rewrites

RSS feed accessible from multiple URLs:

```json
{
  "/blog/rss" → "/api/rss/feed",
  "/blog/feed" → "/api/rss/feed",
  "/rss" → "/api/rss/feed",
  "/feed" → "/api/rss/feed",
}
```

### Redirects

```json
{
  "/portfolio" → "/services" (permanent)
}
```

### Deployment Region

```json
"regions": ["iad1"]    // US East (Virginia)
```

**Rationale:** Primary target audience in US, optimizes latency and Core Web Vitals.

---

## Package Scripts

**File:** `package.json`

Comprehensive npm scripts for development, testing, and deployment.

### Development Scripts

```bash
pnpm dev              # Start development server (port 3000)
pnpm dev:https        # HTTPS development server
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm typecheck        # TypeScript type checking
```

### Testing Scripts

```bash
# E2E Tests (Playwright)
pnpm test:e2e         # All browsers, all tests
pnpm test:e2e:fast    # Chromium only (faster)
pnpm test:e2e:ui      # Interactive UI mode
pnpm test:e2e:a11y    # Accessibility tests only
pnpm test:e2e:report  # View HTML report

# Unit Tests (Bun)
pnpm test:unit        # Run all unit tests
pnpm test:unit:watch  # Watch mode
pnpm test:unit:coverage # With coverage report

# Combined
pnpm test:all         # Lint + typecheck + unit + e2e:fast
pnpm test:ci          # Full CI test suite
```

### Database Scripts

```bash
pnpm db:types:generate  # Generate Supabase types
pnpm db:zod:generate    # Generate Zod schemas from types
pnpm db:generate        # Run both generators
```

### Utility Scripts

```bash
pnpm env:validate     # Validate environment variables
pnpm env:setup        # Copy .env.example → .env.local
pnpm generate-sitemap # Regenerate sitemap
pnpm clean            # Remove build artifacts
pnpm clean:test       # Remove test reports only
```

### Image Optimization

```bash
pnpm optimize:images         # Optimize all images in public/
pnpm optimize:portfolio      # Optimize portfolio images
```

### Git Hooks

```bash
pnpm prepare          # Install lefthook git hooks
```

**Lefthook hooks:**
- Pre-commit: Lint and type check
- Pre-push: Run tests

---

## Environment Variables

**File:** `src/env.ts` (runtime validation with @t3-oss/env-nextjs)

All environment variables are type-safe and validated at startup.

### Required Variables

Application will not start without these:

```bash
RESEND_API_KEY                         # Email service
NEXT_PUBLIC_SUPABASE_URL               # Supabase project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY   # Supabase public key
SUPABASE_SERVICE_ROLE_KEY              # Supabase admin key
SUPABASE_PUBLISHABLE_KEY               # Supabase public key (duplicate)
```

### Security Variables

Required in production, optional in development:

```bash
CSRF_SECRET                            # CSRF protection (32+ chars)
CRON_SECRET                            # Scheduled task auth
```

### Optional Integrations

```bash
DISCORD_WEBHOOK_URL                    # Discord notifications
SLACK_WEBHOOK_URL                      # Slack notifications
N8N_WEBHOOK_SECRET                     # n8n workflow auth
SUPABASE_WEBHOOK_SECRET                # Supabase webhook verification
```

### Optional Features

```bash
KV_REST_API_URL                        # Vercel KV for rate limiting
KV_REST_API_TOKEN                      # KV auth token
ADMIN_API_TOKEN                        # Admin API auth (16+ chars)
ADMIN_EMAILS                           # Comma-separated admin emails
JWT_SECRET                             # JWT signing (16+ chars)
GOOGLE_SITE_VERIFICATION               # Google Search Console
```

### Runtime Validation

Environment variables are validated using Zod schemas in `src/env.ts`:

```typescript
import { env } from '@/env';

// ✅ Type-safe access
const apiKey = env.RESEND_API_KEY;

// ❌ Compile error - doesn't exist
const fake = env.FAKE_VAR;

// ✅ Optional variables are properly typed
const webhook = env.DISCORD_WEBHOOK_URL; // string | undefined
```

**Error Handling:**

If required variables are missing, app fails at startup with clear message:

```
❌ Invalid environment variables:
  - RESEND_API_KEY: Required
  - NEXT_PUBLIC_SUPABASE_URL: Required
```

See `.env.example` for complete list with setup instructions.

---

## Configuration Best Practices

### 1. Type Safety

- All configs use TypeScript where possible
- Environment variables validated with Zod
- Path aliases defined in tsconfig.json

### 2. Security

- No sensitive data in config files
- Security headers in next.config.ts
- CSRF protection via env variable
- API routes excluded from sitemap/robots.txt

### 3. Performance

- Image optimization (WebP format)
- Package import optimization (tree-shaking)
- Minimal Next.js config
- Build compression enabled

### 4. Developer Experience

- Clear script names in package.json
- Comprehensive ESLint rules
- Type-safe imports with @/ alias
- Git hooks for quality checks

### 5. Maintainability

- Semantic color tokens (not hex codes)
- Centralized spacing utilities
- Single source of truth for env vars
- Documentation in this file

---

## Common Tasks

### Adding a New Environment Variable

1. Add to `src/env.ts` schema:
```typescript
server: {
  MY_NEW_VAR: z.string().optional(),
}
```

2. Add to `.env.example` with documentation:
```bash
# My new variable description
MY_NEW_VAR=
```

3. Use typed access:
```typescript
import { env } from '@/env';
const value = env.MY_NEW_VAR;
```

### Adding a New Color Token

1. Add to `src/app/globals.css` in `@theme {}`:
```css
--color-my-color: oklch(0.60 0.15 180);
```

2. Use in components:
```tsx
<div className="bg-my-color text-my-color-foreground">
```

### Adding a New Script

1. Add to `package.json` scripts:
```json
"my-script": "tsx scripts/my-script.ts"
```

2. Document in this file under [Package Scripts](#package-scripts)

---

## Troubleshooting

### Build Failures

1. Check TypeScript: `pnpm typecheck`
2. Check ESLint: `pnpm lint`
3. Clear build cache: `pnpm clean && pnpm build`

### Environment Variable Issues

1. Validate: `pnpm env:validate`
2. Check `.env.local` exists
3. Restart dev server after changing env vars

### Test Failures

1. Check Playwright browsers installed: `pnpm test:e2e:install`
2. Clear test artifacts: `pnpm clean:test`
3. Run specific test: `pnpm test:e2e -- tests/my-test.spec.ts`

---

**Last Updated:** Phase 5 - Configuration Simplification (Plan 3)
**Maintained By:** Hudson Digital Solutions Development Team
