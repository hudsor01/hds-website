# Codebase Concerns

**Analysis Date:** 2026-01-10

## Tech Debt

**God function anti-pattern:**
- Issue: Large, monolithic functions handling multiple responsibilities
- Files: Server Actions in `src/app/actions/` (if present), complex form handlers
- Why: Rapid feature development, unclear separation of concerns
- Impact: Hard to test, maintain, and reason about; violates Single Responsibility Principle
- Fix approach: Extract smaller, focused functions; separate validation, business logic, and data access

**Hardcoded configuration values:**
- Issue: Magic numbers and strings scattered throughout codebase
- Examples: Rate limits, timeouts, validation thresholds
- Why: Quick implementation without abstraction
- Impact: Difficult to change behavior, no single source of truth
- Fix approach: Extract to constants file or environment variables in `src/lib/constants.ts`

**Missing .env.example file:**
- Issue: No template showing required environment variables
- Impact: New developers don't know what env vars to configure
- Blocks: Local development setup, deployment configuration
- Fix approach: Create `.env.example` with all required variables (values as placeholders)

## Known Bugs

**No critical bugs identified:**
- Codebase appears stable with no obvious runtime errors
- TODOs found in code but no FIXME or bug-tracking comments
- User-reported issues not documented in code

## Security Considerations

**Environment variable exposure:**
- Risk: `NEXT_PUBLIC_*` variables exposed to client bundle
- Current mitigation: Only public URLs and anonymous keys are prefixed
- Files: `src/env.ts` (validation schema)
- Recommendations: Regular audit of public env vars, never expose secrets

**Server Action input validation:**
- Risk: Client can send malicious data to Server Actions
- Current mitigation: Zod validation at action boundaries
- Files: `src/app/actions/` (all actions should validate)
- Recommendations: Ensure ALL Server Actions validate input with Zod safeParse

**Rate limiting coverage:**
- Risk: API routes and Server Actions vulnerable to abuse without rate limiting
- Current mitigation: Rate limiter utility exists in `src/lib/rate-limiter.ts`
- Files: `src/app/api/contact/route.ts` (should use rate limiter)
- Recommendations: Apply rate limiting to all public endpoints and form submissions

**Client-side data access patterns:**
- Risk: Direct database queries from client components bypass RLS if not configured
- Current mitigation: RLS policies configured in database
- Files: API routes and Server Actions handle all data mutations
- Recommendations: Prefer Server Actions for mutations, maintain RLS policies

## Performance Bottlenecks

**Large globals.css file:**
- Problem: Single CSS file with all utilities and custom classes
- File: `src/app/globals.css`
- Measurement: File size not measured, but contains extensive utilities
- Cause: All Tailwind utilities + custom semantic classes in one file
- Improvement path: Consider CSS splitting, tree-shaking unused utilities

**Potential bundle size concerns:**
- Problem: Large dependency tree (130+ packages)
- Measurement: First load JS should stay under 180kB per page (monitor in build output)
- Cause: Comprehensive UI component library (Radix UI), full feature set
- Improvement path: Dynamic imports for heavy components, monitor bundle analyzer

**Image optimization reliance:**
- Problem: Performance depends on proper Image component usage
- Risk: Direct `<img>` tags bypass Next.js optimization
- Files: All image usage should use `next/image`
- Improvement path: Lint rule to prevent `<img>` tags, enforce Image component

## Fragile Areas

**Middleware execution order:**
- File: `proxy.ts` (Next.js 16 proxy)
- Why fragile: Auth session refresh must happen before route handlers
- Common failures: Stale sessions if middleware doesn't run, redirect loops
- Safe modification: Test auth flows after any middleware changes
- Test coverage: No dedicated middleware tests (E2E tests cover indirectly)

**Environment variable validation:**
- File: `src/env.ts`
- Why fragile: Application crashes on startup if env vars missing or invalid
- Common failures: Deployment fails if env vars not set in hosting platform
- Safe modification: Add new env vars to schema, test locally before deploying
- Test coverage: No unit tests for env validation (relies on Zod runtime checks)

**Third-party API integrations:**
- Files: `src/lib/email/` (Resend), `src/lib/db.ts` (Drizzle/Neon)
- Why fragile: External service downtime breaks features
- Common failures: Email sending fails, database queries timeout
- Safe modification: Always wrap in try/catch, return user-friendly errors
- Test coverage: Mock external services in tests, no integration tests

## Scaling Limits

**Vercel Hobby Plan:**
- Current capacity: Serverless function limits, bandwidth caps
- Limit: Function execution time, concurrent requests
- Symptoms at limit: 504 timeouts, 429 rate limits from platform
- Scaling path: Upgrade to Pro plan ($20/mo), optimize bundle size

**Neon Free Tier:**
- Current capacity: Database size, compute limits
- Limit: 0.5GB storage, 10 branches, 191 compute hours/month
- Symptoms at limit: Database writes fail, compute suspended
- Scaling path: Upgrade to Neon Pro ($19/mo) or Scale ($69/mo)

**Client-side state management:**
- Current capacity: Simple useState and useActionState patterns
- Limit: Complex global state scenarios not well-supported
- Symptoms at limit: Prop drilling, redundant API calls, state sync issues
- Scaling path: Introduce Zustand for complex client state (already installed but unused)

## Dependencies at Risk

**Potential outdated packages:**
- Risk: Regular dependency updates needed to avoid security vulnerabilities
- Impact: Known CVEs in dependencies, missing features from newer versions
- Files: `package.json` (monitor with `bun update` or Dependabot)
- Migration plan: Regular update schedule, test after updates

**React 19 ecosystem maturity:**
- Risk: React 19.2.3 is very recent (January 2025), ecosystem catching up
- Impact: Some third-party libraries may not be fully compatible
- Files: All React component dependencies
- Migration plan: Monitor compatibility issues, report to library maintainers

## Missing Critical Features

**.env.example template:**
- Problem: No template for required environment variables
- Current workaround: Developers reference documentation or ask teammates
- Blocks: Quick local setup, clear onboarding
- Implementation complexity: Low (copy .env.local, replace values with placeholders)

**Comprehensive error logging:**
- Problem: Logger exists (`src/lib/logger.ts`) but may not be used everywhere
- Current workaround: Some console.log usage may remain
- Blocks: Production debugging, error monitoring integration
- Implementation complexity: Low (audit codebase, replace console with logger)

**Test coverage for critical paths:**
- Problem: Limited component tests, no integration tests
- Current workaround: Manual testing, E2E tests for happy paths
- Blocks: Confidence in refactoring, regression prevention
- Implementation complexity: Medium (write tests for existing code)

**API documentation:**
- Problem: No OpenAPI/Swagger spec for API routes
- Current workaround: Read code to understand endpoints
- Blocks: API consumer onboarding, third-party integrations
- Implementation complexity: Medium (add documentation generation)

## Test Coverage Gaps

**Component unit tests:**
- What's not tested: Most React components lack unit tests
- Risk: Regressions in UI logic, prop handling, conditional rendering
- Priority: Medium
- Difficulty to test: Low (setup already exists with @testing-library/react)

**Server Action error paths:**
- What's not tested: Error handling in Server Actions
- Risk: Uncaught errors, poor error messages to users
- Priority: High
- Difficulty to test: Medium (need to mock Drizzle, Resend failures)

**Middleware edge cases:**
- What's not tested: Auth refresh failures, redirect logic, session expiry
- Risk: Auth loops, broken protected routes
- Priority: High
- Difficulty to test: High (complex integration scenarios)

**API route integration:**
- What's not tested: End-to-end API route behavior with real database
- Risk: Database schema mismatches, RLS policy violations
- Priority: Medium
- Difficulty to test: High (need test database, seeding strategy)

## Code Quality Observations

**Positive Patterns:**
- Strong TypeScript usage with strict mode
- Server-first architecture minimizes client bundle
- Zod validation at boundaries
- Consistent file organization

**Areas for Improvement:**
- Add explicit return types to more functions
- Document complex business logic with comments
- Create shared types for common patterns (ActionState, etc.)
- Establish testing culture for new features

---

*Concerns audit: 2026-01-10*
*Update as issues are fixed or new ones discovered*
