# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🔒 PRODUCTION-READY SECURITY STATUS

**Hudson Digital Solutions** has undergone comprehensive security transformation following official **React 19** and **Next.js 15** documentation. All critical vulnerabilities have been resolved.

**Security Score: 9.2/10 - PRODUCTION READY** ✅

## Project Overview

Hudson Digital Solutions is a production-ready business website focused on lead generation with enterprise-grade security. Built with Next.js 15 and React 19, it provides professional design combined with robust security implementations.

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5.8
- **Styling**: Tailwind CSS v4 (zero-config), Radix UI, Framer Motion
- **API Layer**: tRPC for type-safe APIs with REST endpoint compatibility
- **Database**: PostgreSQL with Prisma ORM
- **Forms**: React Hook Form with Zod validation
- **State Management**: Zustand for client state, React Query for server state
- **Email**: Resend for transactional emails with template system
- **Security**: Enterprise-grade security implementation
- **Deployment**: Docker, Nginx, Vercel support

## Development Commands

### Security Validation
```bash
npm run security:validate    # Validate security implementations
npm run security:startup     # Comprehensive startup validation
npm run security:full        # Complete security check
```

### Production Deployment
```bash
npm run production:validate  # Pre-deployment validation
npm run production:build     # Validated production build
npm run production:start     # Secure production start
```

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint checking
npm run lint:fix     # Auto-fix linting issues
npm run format       # Run Prettier formatting
npm run type-check   # Run TypeScript type checking

# Bundle Analysis
npm run analyze      # Analyze bundle with Next.js analyzer
npm run build:analyze # Build and generate bundle report
npm run size-check   # Check bundle sizes against limits
npm run optimize     # Full optimization check (perf + bundle + size)

# Performance Monitoring
npm run perf         # Run performance monitor
npm run perf:watch   # Watch files and run perf checks
```

## Core Development Principles

1. **No Barrel Files**: 
   - Do not create index.ts files in any directory
   - No barrel exports or re-exporting through index files
   - Import directly from source files, never from directories

2. **No Enhanced/Prefixed Components**:
   - Never create files with prefixes like "enhanced", "optimized", "simple", "advanced", etc.
   - Instead of creating "enhancedHeader.tsx", update the existing "header.tsx" file
   - Consolidate functionality into the original file rather than creating variants
   - Follow DRY principles - one component, one responsibility

3. **Tailwind CSS v4 Zero-Config**:
   - NO tailwind.config.js file - everything is configured in CSS
   - All configuration done via @theme directive in globals.css
   - Uses zero-configuration content detection (no content paths needed)
   - Theme variables use proper namespaces (--color-*, --text-*, etc.)

## Project Architecture

### Hybrid API Architecture

The project uses a **dual API approach** for maximum compatibility:

1. **tRPC (Primary)**: Type-safe API with React Query integration
   - Located in `app/api/trpc/routers/`
   - Unified router pattern in `unified-router.ts`
   - Domain-based sub-routers (contact, newsletter, analytics, lead-magnet, auth)

2. **REST Endpoints (Compatibility)**: Traditional REST endpoints that internally call tRPC
   - Located in `app/api/[endpoint]/route.ts`
   - Provides compatibility for webhooks and external integrations
   - Enhanced security with comprehensive validation

**Key Pattern**: All business logic lives in tRPC routers, REST endpoints are thin wrappers that call tRPC procedures internally with enhanced security validation.

### State Management Pattern

**Three-layer State Architecture**:
1. **Server State**: React Query + tRPC for all API data
2. **Client State**: Zustand stores organized by domain
   - `analytics-store.ts` - Page view and event tracking
   - `form-store.ts` - Form submission states and validation
   - `ui-store.ts` - Loading states, modals, notifications
3. **Component State**: React Hook Form for form-specific state

## Development Patterns

### Server Components First (React 19)
- Default to Server Components (no `'use client'` directive)
- Only add `'use client'` when necessary (interactivity, hooks, browser APIs)
- Keep data fetching in Server Components where possible
- Use React 19 Server Actions for form handling

### Secure Form Implementation Pattern
1. Create form schema in `lib/validation/form-schemas.ts` with comprehensive validation
2. Add tRPC procedure in appropriate router with security middleware
3. Create form component extending `BaseForm` with security features
4. Add email template if form sends emails
5. Create REST endpoint wrapper with enhanced security validation
6. Implement rate limiting and spam protection
7. Add security logging and monitoring

### Component Creation Guidelines
- Use domain-driven naming: `entity-action.tsx` (e.g., `contact-form.tsx`)
- Keep components focused and single-responsibility
- Follow progressive enhancement (work without JavaScript)
- Implement proper loading states and error boundaries
- Apply security considerations (input validation, XSS prevention)

## Environment Configuration

### Required Environment Variables
```env
# Core Application
NODE_ENV=production          # development, production, or test
NEXT_PUBLIC_APP_URL=         # Your site URL (e.g., https://yourdomain.com)
DATABASE_URL=                # PostgreSQL connection string

# Email (Required)
RESEND_API_KEY=              # Resend API key for email delivery
RESEND_FROM_EMAIL=           # Verified sending domain
CONTACT_EMAIL=               # Receives form submissions

# Security (ENHANCED - Required)
JWT_SECRET=                  # JWT signing secret (MINIMUM 32 chars, NO DEFAULTS)
ADMIN_USERNAME=              # Admin username (NOT 'admin' in production)
ADMIN_PASSWORD_HASH=         # bcrypt hash for production (REQUIRED in production)
ADMIN_PASSWORD=              # Plain password for development only

# Supabase (Optional - for enhanced auth/database features)
NEXT_PUBLIC_SUPABASE_URL=    # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY=   # Supabase service role key

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID= # Google Analytics measurement ID
NEXT_PUBLIC_POSTHOG_KEY=     # PostHog analytics key
NEXT_PUBLIC_POSTHOG_HOST=    # PostHog host URL
```

### Security Requirements for Production
1. **JWT_SECRET**: Must be 32+ characters, cannot use defaults like 'your-secret-key'
2. **ADMIN_USERNAME**: Cannot be 'admin' in production, must be unique
3. **ADMIN_PASSWORD_HASH**: Required in production, use bcrypt with 12 salt rounds
4. **Environment Validation**: All security variables validated at startup

## Code Quality Standards

### File Naming and Consolidation
- **No Enhanced/Prefixed Files**: Consolidate enhanced-, optimized-, improved- files into originals
- **Direct Imports**: Import from source files, never from directories or barrel files
- **Type Organization**: All types in `/types` directory, no inline type definitions
- **Enum Centralization**: All enums in `/types/enum-types.ts`

### Security Implementation
- **No Duplication**: Consolidate all redundant implementations
- **Type Safety**: Replace all `any` types with proper types from `/types` directory
- **Error Handling**: Use standardized error handling patterns with security awareness
- **Performance**: Monitor Core Web Vitals impact of all features
- **Security**: Apply security-first development practices throughout