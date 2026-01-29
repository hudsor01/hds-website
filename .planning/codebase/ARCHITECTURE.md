# System Architecture

**Analysis Date:** 2026-01-10

## Pattern Overview

**Type:** Full-stack React framework with server-first architecture

**Core Pattern:** Next.js 16 App Router with React Server Components as the default rendering strategy. The architecture prioritizes server-side execution, using client components only when necessary for interactivity (hooks, events, browser APIs).

**Key Characteristics:**
- Server Components by default - reduces client bundle size
- Streaming SSR for progressive page rendering
- Server Actions for mutations without API routes
- Middleware for cross-cutting concerns (auth, logging)
- Edge-compatible for global low-latency delivery

## Conceptual Layers

**1. Presentation Layer**
- Location: `src/app/**/*.tsx`, `src/components/`
- Responsibility: UI rendering, user interaction, visual layout
- Components:
  - Server Components (default): `src/app/`, `src/components/layout/`, `src/components/ui/` (non-interactive)
  - Client Components: `src/components/forms/`, interactive UI components (marked with 'use client')
  - Layouts: `src/app/layout.tsx` (root), `src/app/(tools)/layout.tsx` (route group)
- Patterns: Composition over inheritance, prop drilling minimized with context
- Styling: Tailwind CSS utility-first with semantic classes in `src/app/globals.css`

**2. Business Logic Layer**
- Location: `src/app/actions/`, `src/lib/`
- Responsibility: Application rules, data transformation, validation
- Server Actions: `src/app/actions/` (form processing, mutations marked with 'use server')
- Utilities: `src/lib/` (validation schemas, helpers, analytics)
- Validation: Zod schemas in `src/lib/schemas/` (runtime type checking)
- Patterns: Pure functions, immutable data, explicit error handling

**3. Data Access Layer**
- Location: `src/utils/supabase/`, `src/lib/supabase.ts`
- Responsibility: Database queries, authentication, external data
- Supabase Clients:
  - Server: `src/utils/supabase/server.ts` (Server Components with cookie handling)
  - Browser: `src/utils/supabase/client.ts` (Client Components with SSR support)
  - Admin: `src/lib/supabase.ts` (service role for public data, background jobs)
- Patterns: Repository pattern for data access, row-level security enforcement
- Queries: Direct Supabase queries, no ORM

**4. Integration Layer**
- Location: `src/lib/email/`, `src/lib/pdf/`, `src/app/api/`
- Responsibility: External service communication
- Email: `src/lib/email/` (Resend integration)
- PDF: `src/lib/pdf/` (Puppeteer headless browser)
- Rate Limiting: `src/lib/rate-limiter.ts` (Vercel KV)
- API Routes: `src/app/api/` (REST endpoints, webhooks)

**5. Infrastructure Layer**
- Location: Middleware, configuration files, environment setup
- Responsibility: Cross-cutting concerns, app initialization
- Middleware: `src/middleware.ts` (auth refresh, request logging)
- Auth Middleware: `src/lib/supabase/middleware.ts` (session management)
- Environment: `src/env.ts` (type-safe config validation)
- Logging: `src/lib/logger.ts` (unified logging interface)
- SEO: `src/lib/seo-utils.ts` (structured data, metadata)

## Data Flow

**Request Lifecycle:**

1. **Incoming Request** → `src/middleware.ts`
   - Auth session refresh via `src/lib/supabase/middleware.ts`
   - Request logging preparation
   - Continues to page/route handler

2. **Server Component Render** → `src/app/**/*.tsx`
   - Executes server-side data fetching
   - Queries Supabase via `src/utils/supabase/server.ts`
   - Transforms data with utilities from `src/lib/`
   - Renders to HTML stream

3. **Client Hydration** → Client Components
   - Browser receives HTML stream
   - React hydrates interactive components marked 'use client'
   - Client-side state managed with hooks (useState, useActionState)

4. **Form Submission** → Server Actions
   - Client component calls Server Action from `src/app/actions/`
   - Server validates with Zod schema from `src/lib/schemas/`
   - Server Action mutates data via Supabase
   - Returns typed state object to client
   - Client updates UI based on response

5. **API Request** → `src/app/api/**/*.ts`
   - External webhook or direct API call
   - Route handler validates input
   - Processes with business logic from `src/lib/`
   - Returns JSON response

**State Management:**
- Server State: React Server Components (no client state)
- Form State: `useActionState` hook with Server Actions
- Client State: `useState` for local UI state only
- Context: Used sparingly for deeply nested prop passing (Toast, theme)

## Key Abstractions

**Server Actions Pattern:**
- Files: `src/app/actions/**/*.ts` (marked with 'use server')
- Purpose: Type-safe mutations without API routes
- Interface: Accept FormData or typed arguments, return state object
- Example: Contact form submission, data mutations
- Benefits: Progressive enhancement, no separate API layer

**Validation Pattern:**
- Files: `src/lib/schemas/**/*.ts` (Zod schemas)
- Purpose: Runtime type validation at system boundaries
- Usage: Server Actions, API routes, form inputs
- Pattern: `schema.safeParse()` never throws, returns success/error
- Example: `contactFormSchema`, `emailSchema`, `phoneSchema`

**Error Handling Pattern:**
- Utility: `castError` from `src/utils/errors.ts`
- Logger: `src/lib/logger.ts` (structured logging)
- Pattern: Try/catch → log error → return user-friendly message
- Never expose internal error details to users
- All errors logged with context for debugging

**Authentication Pattern:**
- Middleware: `src/lib/supabase/middleware.ts` refreshes sessions
- Server: `src/utils/supabase/server.ts` for auth checks in Server Components
- Client: `src/utils/supabase/client.ts` for client-side auth UI
- Protection: Middleware redirects unauthenticated users
- Session: Cookie-based with automatic refresh

**Layout Composition:**
- Root: `src/app/layout.tsx` (metadata, providers, global layout)
- Route Groups: `src/app/(tools)/layout.tsx` (URL structure without nesting)
- Components: `src/components/layout/NavbarLight.tsx`, `src/components/layout/Footer.tsx`
- Pattern: Nested layouts for shared structure

## Entry Points

**Application Bootstrap:**
- `src/app/layout.tsx` - Root layout, metadata, providers, analytics
- `src/middleware.ts` - Request interception for auth and logging
- `src/env.ts` - Environment validation on startup

**Page Entry Points:**
- `src/app/page.tsx` - Home page (root route)
- `src/app/(tools)/**/*.tsx` - Tool pages (paystub, invoice, timesheet, etc.)
- `src/app/api/**/*.ts` - API route handlers

**Service Initialization:**
- `src/lib/supabase.ts` - Singleton Supabase client export
- `src/lib/logger.ts` - Logger instance export
- `src/lib/rate-limiter.ts` - Rate limiter initialization

## Module Boundaries

**Clear Separation:**
- `src/app/` - Next.js routing and pages (framework layer)
- `src/components/` - Reusable UI components (presentation layer)
- `src/lib/` - Business logic and utilities (domain layer)
- `src/utils/` - Framework integrations (Supabase clients)
- `src/types/` - TypeScript type definitions (shared types)

**Import Rules:**
- Components import from `@/lib/`, `@/types/`, other components
- Lib utilities are pure, import only types and other lib utilities
- App pages import from all layers (presentation + business + data)
- No circular dependencies between modules

**Dependency Direction:**
- Presentation → Business Logic → Data Access
- Never: Data Access → Business Logic (violates layering)
- Never: Business Logic → Presentation (tight coupling)

---

*Architecture analysis: 2026-01-10*
*Update after major structural changes*
