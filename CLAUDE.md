# CLAUDE.md

**NO EMOJIS** - Never use emojis unless explicitly requested. Use Heroicons/Lucide React for UI icons.
**NO CODE EXAMPLES NEEDED** - This project uses standard patterns. Search the codebase for existing examples.
- **SIMPLICITY**: Use native features first. No unnecessary abstractions.
- **TYPE SAFETY**: TypeScript strict mode. NO `any` types. Use Zod for runtime validation.
- **SERVER-FIRST**: Default to Server Components. Client components ONLY for hooks/events/browser APIs.
- **PERFORMANCE**: WebP images, monitor bundle size, lazy load heavy components.
**YAGNI (You Aren't Gonna Need It):**
Do not implement features, functionality, or infrastructure that is not immediately required for the current requirements. No speculative coding, no "just in case" implementations, no premature optimization. If it's not needed now, it will not be developed. This rule applies to libraries, frameworks, database schemas, API endpoints, and business logic.
**Composition Over Inheritance:**
All system components must be built using composition rather than inheritance hierarchies. Avoid deep inheritance trees. Prefer building functionality by combining smaller, independent components rather than creating parent-child class relationships. This ensures flexibility, testability, and prevents brittle code that breaks when parent classes change.
**Explicit Data Flow & Type Safety:**
All data must have clearly defined, strongly typed interfaces. No dynamic types, no implicit conversions, no untyped objects passed between functions. All inputs, outputs, and transformations must be explicitly declared with proper type annotations. Any data that crosses module boundaries must be validated and typed.
**Small, Focused Modules (High Cohesion, Low Coupling):**
Each module, class, function, and component must have a single, well-defined purpose. Modules must not exceed reasonable size limits and should only contain code directly related to their primary responsibility. Dependencies between modules must be minimal and clearly defined through explicit interfaces.
**Fail Fast, Log Precisely:**
Systems must validate inputs immediately and throw clear, specific errors when invalid data is encountered. Do not attempt to recover from invalid states silently. All error conditions must be logged with sufficient context to identify the root cause without requiring additional debugging. Error messages must be actionable.
**Idempotency Everywhere:**
All operations, especially those that modify state or interact with external systems, must be idempotent. Running the same operation multiple times must produce the same result as running it once. This applies to database operations, API calls, file operations, and any state-changing functions.
**Predictable State Management:**
All application state must be managed in a deterministic, traceable manner. No hidden global state, no implicit side effects, no shared mutable state between components. State changes must follow clear, predictable patterns with no race conditions or unexpected interactions.
**Single Responsibility:**
Every function, class, module, and service must have exactly one reason to change. If a component handles multiple concerns or domains, it must be split into separate components. This applies to business logic, data access, presentation, and infrastructure concerns.
**Prefer Readability Over Cleverness:**
Code must be written for human understanding first, performance second. No clever tricks, no overly compact syntax, no "smart" solutions that sacrifice clarity. The codebase must be understandable by any team member without requiring extensive documentation or explanation.

**File Organization:**
- `src/app/` - Next.js 15 App Router pages, layouts, and API routes
- `src/app/(tools)/` - Route groups (URL: /paystub not /tools/paystub)
- `src/app/actions/` - Server Actions for form submissions
- `src/app/api/` - API route handlers
- `src/components/layout/` - NavbarLight, Footer
- `src/components/forms/` - Form-specific components
- `src/components/ui/` - Base reusable components
- `src/lib/` - Core utilities (logger, analytics, seo-utils)
- `src/lib/schemas/` - Zod validation schemas
- `src/types/` - TypeScript type definitions
- `src/hooks/` - Custom React hooks
- `tests/` - Vitest unit tests
- `e2e/` - Playwright end-to-end tests

**Metadata:**
- Export metadata object from all page components
- Title, description (120-160 chars for SEO)
- OpenGraph and Twitter card data
- Structured data goes in script tags in body, NOT metadata.other
- Use generateWebsiteSchema, generateOrganizationSchema from lib/seo-utils

**Hooks:**
- useState for local UI state only
- useActionState for forms (replaces useFormState)
- useFormStatus for submit button pending states
- useRef for non-reactive values (timers, RAF IDs)
- useCallback for stable function references

**Context:**
- Create context with undefined default
- Custom hook checks context exists
- Throw error if used outside provider
- Example: ToastProvider, useToast pattern

**Error Handling:**
- Use castError helper from utils/errors.ts
- Always wrap operations in try/catch
- Log errors with logger.error, never console
- Return typed error states from Server Actions

**Tailwind-First Approach:**
- Create semantic CSS classes for repeated patterns in globals.css
- Use CSS custom properties, not hard-coded values

**Component Styling:**
- Utility-first with Tailwind classes
- Glass morphism pattern: .glass-card, .glass-card-light
- Gradient text: .gradient-text
- Semantic utilities: .section-spacing, .card-padding
- Hover states: .hover-lift, .button-hover-glow
- Transitions: .transition-smooth

**Organization:**
- Layout components in components/layout/
- Form components in components/forms/
- Base UI in components/ui/
- Feature-specific in components/[feature]/
- Shared components at components/ root

**Structure:**
- Imports first (grouped: types, React, third-party, local)
- Types/Interfaces second
- Constants third (UPPER_SNAKE_CASE)
- Component function fourth
- Sub-components last (if small and only used here)

**Naming:**
- Components: PascalCase (ContactForm.tsx)
- Utils: kebab-case (seo-utils.ts)
- Constants: UPPER_SNAKE_CASE (TOAST_DURATION_DEFAULT)
- Functions: camelCase (calculateTotal)

**Zod Schemas:**
- Location: lib/schemas/
- common.ts for reusable validators (email, phone, name)
- Feature-specific files for form schemas
- Export schema and inferred type
- Always use safeParse, never parse

**Form Pattern:**
- Server Action validates with Zod
- Returns state object with success/error
- Client component uses useActionState
- SubmitButton uses useFormStatus for pending state
- Progressive enhancement - forms work without JS

**Unit Tests (Vitest):**
- Location: tests/unit/
- Test utilities, validation, pure functions
- Mock external dependencies
- Run: pnpm test:unit

**E2E Tests (Playwright):**
- Location: e2e/
- Test user flows, form submissions, navigation
- Multiple browsers: chromium, firefox, webkit
- Run: pnpm test:e2e (all) or pnpm test:e2e:fast (chromium only)

**Test Coverage:**
- Validation schemas must have tests
- Critical user flows must have E2E tests
- Server Actions should have unit tests

## PERFORMANCE

**Images:**
- ALWAYS use Next.js Image component
- Format: WebP for all images
- Specify width and height explicitly
- Use priority prop for above-fold images
- Lazy load by default for below-fold

**Code Splitting:**
- Dynamic imports for heavy components
- next/dynamic with loading fallback
- ssr: false for client-only components
- Modular imports enabled for Heroicons

**Bundle Size:**
- Keep first load JS under 180kB per page
- Monitor bundle size in build output

## LOGGING & ANALYTICS

**Logger (NOT console.log):**
- ALWAYS use logger from lib/logger
- logger.info for events, user actions
- logger.error for errors, failures
- logger.debug for development only
- NEVER use console.log/warn/error directly

**Analytics:**
- Vercel Analytics for performance
- CTA clicks auto-tracked via CTAButton component
- Form submissions auto-tracked via Server Actions
- Custom events: logger.info with metadata

## ACCESSIBILITY

**Semantic HTML:**
- Use proper landmarks (main, nav, section, article)
- main#main-content for skip link target
- Headings in order (h1, h2, h3 - no skipping)
- Lists for navigation and grouped content

**ARIA:**
- aria-label for interactive elements without text
- aria-hidden="true" for decorative icons
- aria-live for dynamic content (assertive for errors, polite for info)
- role="alert" for error messages
- role="progressbar" with aria-valuenow for progress indicators

**Keyboard Navigation:**
- All interactive elements keyboard accessible
- Use button element, not div with onClick
- Focus states visible (.focus-ring utility)
- Tab order logical and complete

## INTEGRATIONS

**Resend (Email):**
- API key from env: RESEND_API_KEY
- Send from: hello@hudsondigitalsolutions.com
- HTML emails with proper headers
- Error handling with logger.error

**Neon (Database with Drizzle ORM):**
- `@/lib/db` - Drizzle ORM client for all database operations
- `@/lib/schema` - Drizzle schema definitions with type exports
- `@/lib/auth/client` - Neon Auth client for browser authentication
- `@/lib/auth/server` - Neon Auth server utilities
- Environment vars: DATABASE_URL, NEON_AUTH_BASE_URL
- Use Drizzle query syntax: `db.select().from(table).where(eq(column, value))`
- Schema uses camelCase (maps to snake_case columns automatically)
- Log database errors, return user-friendly messages


**RULES & GUIDELINES:**
- Search codebase for existing patterns first
- Validate at boundaries with Zod (forms, APIs)
- Type everything explicitly (no implicit any)
- Use semantic HTML and ARIA (accessibility)
- Clean up timers, listeners, subscriptions (useEffect)
- Handle errors gracefully (try/catch, user feedback)
- Test keyboard navigation (accessibility)
- Check bundle size (performance)
- Use logger not console (unified logging)
- Use constants for magic numbers (maintainability)

## DEVELOPMENT COMMANDS

**Development:**
- pnpm dev - Start development server
- pnpm build - Production build
- pnpm start - Start production server
- pnpm lint - Run ESLint
- pnpm typecheck - TypeScript type checking
- pnpm test:unit - Run unit tests
- pnpm test:e2e - Run E2E tests (all browsers)
- pnpm test:e2e:fast - Run E2E tests (chromium only)
- pnpm test:all - Run all checks (lint, typecheck, tests)

**Analysis:**
- pnpm test:unit:coverage - Test coverage report

## GIT WORKFLOW

**Before Commit:**
- Run: pnpm lint && pnpm typecheck
- Fix all errors and warnings
- Verify build succeeds

**Commit Message Format:**
- First line: type: description (feat:, fix:, refactor:, docs:)
- Blank line
- Detailed changes as bullet points
- Keep first line under 50 characters
- Explain WHY, not WHAT (code shows what)

**Server Action Pattern:**
- File in app/actions/ with 'use server'
- Accept _prevState and FormData
- Validate with Zod safeParse
- Return typed state object
- Used with useActionState in client component

**Form Pattern:**
- Client component with 'use client'
- useActionState for form state
- Server Action for submission
- SubmitButton with useFormStatus
- Error display from state.error
- Success message from state.success

**Toast Pattern:**
- Use useToast hook in components
- Call showToast with type, title, message
- Auto-dismisses after duration
- Manual dismiss with close button

**Icon Pattern:**
- IconButton for clickable icons
- Always aria-label for buttons
- aria-hidden="true" for decorative icons

**Error Handling Pattern:**
- try/catch around all async operations
- Log with logger.error, include context
- Return user-friendly error messages
- Never expose internal error details

## WHEN IN DOUBT
- Choose simplicity over cleverness
- Use native platform features over custom solutions
- Delete code instead of adding when possible
- Search codebase before implementing
- Ask user if requirements unclear
- Follow existing patterns in codebase
- Prioritize type safety and accessibility
- Remember: this is production code, not a demo
