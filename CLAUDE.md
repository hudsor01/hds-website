# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern business website for Hudson Digital Solutions built with Next.js 15, React 19, and TypeScript. It's a high-performance marketing site with contact forms, analytics, and automated email sequences.

## Key Development Principles

### Core Principles to Follow
1. **YAGNI (You Aren't Gonna Need It)**: Don't add abstraction until proven necessary
2. **KISS (Keep It Simple)**: Direct implementations over complex patterns
3. **DRY (Don't Repeat Yourself)**: Use decorators and interceptors for cross-cutting concerns
4. **Single Responsibility**: Each service handles one domain entity
5. **Explicit over Implicit**: Clear, direct code over "clever" abstractions

These principles guide all development decisions. Prioritize simplicity and maintainability over premature optimization. Avoid over-engineering solutions before requirements are clear.

## Development Commands

### Core Commands
```bash
# Development
npm run dev                # Start development server
npm run dev:https         # Start development server with HTTPS

# Build & Production
npm run build             # Production build
npm run build:local       # Build with local env
npm run build:analyze     # Build with bundle analyzer
npm run start             # Start production server
npm run start:local       # Start production server with local env

# Quality & Analysis
npm run lint              # ESLint checking
npm run typecheck         # TypeScript type checking
npm run check:bundle      # Analyze bundle size
```

### Testing Commands
```bash
# E2E Testing (Playwright)
npm run test:e2e          # Run all e2e tests
npm run test:e2e:ui       # Run e2e tests with UI mode
npm run test:e2e:fast     # Run chromium tests only (fast)
npm run test:e2e:a11y     # Run accessibility tests only
npm run test:e2e:animations # Run animation performance tests
npm run test:e2e:report   # Show test report
npm run test:e2e:install  # Install Playwright browsers
npm run test:update-snapshots # Update visual snapshots

# Unit Testing (Jest)
npm run test:unit         # Run unit tests
npm run test:unit:watch   # Run tests in watch mode
npm run test:unit:coverage # Run tests with coverage

# Combined Testing
npm run test:all          # Run lint, typecheck, unit and fast e2e
npm run test:ci           # Full CI test suite
```

### Utility Commands
```bash
# Environment & Setup
npm run env:setup         # Create .env.local from template
npm run env:validate      # Validate environment variables

# Database
npm run db:types:generate # Generate Supabase types

# Image Optimization
npm run optimize:images   # Optimize all images
npm run optimize:portfolio # Optimize portfolio images

# Maintenance
npm run clean             # Clean all build artifacts
npm run clean:test        # Clean test reports
npm run generate-sitemap  # Generate sitemap.xml
```

## Architecture & Structure

### Next.js App Router Structure
- **Pages**: All routes in `src/app/` using App Router
- **API Routes**: RESTful endpoints in `src/app/api/`
- **Components**: Reusable UI components in `src/components/`
- **Layouts**: Shared layout components in `src/components/layout/`

### Key Architectural Patterns

#### Email System Architecture
The contact form triggers automated email sequences:
1. **Admin notification** to `hello@hudsondigitalsolutions.com`
2. **Client welcome email** with immediate nurturing sequence
3. **Lead scoring** determines sequence type (welcome vs consultation)
4. **Templates** in `src/lib/email-sequences.ts` with conditional logic

#### Analytics & Monitoring
Multi-platform analytics setup:
- **PostHog**: Product analytics, feature flags, session recordings  
- **Vercel Analytics**: Core Web Vitals, performance monitoring
- **Custom Web Vitals**: Real user monitoring via API endpoint

#### Performance Optimization
- **Edge Runtime**: API routes use Edge Runtime where possible
- **Image Optimization**: WebP/AVIF formats with long caching
- **Code Splitting**: Modular imports for icons and components
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Caching Strategy**: Multi-level caching (CDN, browser, ISR)

#### State Management
- **Zustand**: For client-side state management
- **React Hook Form**: Form state and validation
- **Zod**: Schema validation for forms and API endpoints

### Security & Headers
Comprehensive security implemented via:
- **Next.js config headers**: Security headers applied globally
- **Middleware**: Additional security and performance headers
- **HTTPS enforcement**: Production redirects, HSTS
- **CORS configuration**: API route protection
- **CSP**: Content Security Policy via Vercel config

## Environment Variables & Secret Management

### Secret Management System
We use `dotenv-cli` for secure environment variable management:
- **Never expose keys**: All scripts use dotenv-cli to load secrets
- **Environment separation**: Different .env files for dev/test/prod
- **Validation**: Run `npm run env:validate` to check configuration
- **Documentation**: See `/docs/SECRET_MANAGEMENT.md` for full guide

### Quick Setup
```bash
# Initial setup - creates .env.local from template
npm run env:setup

# Validate your configuration
npm run env:validate

# All npm scripts automatically load correct environment
npm run dev          # Uses .env.local
npm run test:e2e     # Uses .env.test
npm run build        # Uses .env.production
```

### Required Variables
```bash
RESEND_API_KEY=             # Email sending via Resend
```

### Analytics & Monitoring
```bash
NEXT_PUBLIC_POSTHOG_KEY=    # PostHog project API key
NEXT_PUBLIC_POSTHOG_HOST=   # PostHog host URL
```

### SEO & Verification
```bash
GOOGLE_SITE_VERIFICATION=   # Google Search Console
```

### GitHub Actions Setup
See `/docs/GITHUB_SECRETS_SETUP.md` for CI/CD secret configuration

## Contact Form Flow
1. Form submission triggers `/api/contact` endpoint
2. **Validation**: Server-side validation with rate limiting  
3. **Email sending**: Admin notification + client welcome
4. **Lead scoring**: High-intent detection for consultation requests
5. **Sequence scheduling**: Automated nurturing emails via Resend
6. **Analytics**: Conversion events sent to PostHog

## Performance Considerations
- **Bundle optimization**: Tree shaking, code splitting
- **Image handling**: Next.js Image component with optimization
- **Font loading**: Google Fonts with display swap
- **Critical CSS**: Inlined critical styles
- **Service Worker**: PWA capabilities with offline support

## TypeScript Architecture
- **Strict mode**: Full TypeScript strict mode enabled
- **Path mapping**: `@/` alias for `src/` directory
- **Type definitions**: Custom types in `src/types/`
- **API types**: Shared between frontend and backend

## Deployment (Vercel)
- **Edge functions**: Contact API and analytics on Edge Runtime
- **Regional deployment**: US East (iad1) for performance
- **Build optimization**: Webpack customizations, memory limits
- **Environment**: Node.js 20.x with optimized memory allocation

## Testing Contact Form
Three methods available:
1. **Live site**: `https://hudsondigitalsolutions.com/contact`
2. **Local development**: `http://localhost:3000/contact`  
3. **Script**: `npx tsx test-contact-form.ts`

All emails sent to `hello@hudsondigitalsolutions.com`

## Testing Strategy

### E2E Testing (Playwright)
- **Test structure**: Tests in `/e2e` directory
- **Page objects**: Reusable selectors in `/e2e/page-objects`
- **Helpers**: Test utilities in `/e2e/helpers`
- **Projects**: Multiple browser configurations (Chrome, Firefox, Safari, Mobile)
- **Animation tests**: Special project for testing animations with GPU acceleration
- **Accessibility tests**: Tagged with `@accessibility` for isolated runs

### Unit Testing (Jest)
- **Test location**: `__tests__` directory and `*.test.ts` files
- **Coverage**: Configured for `src/**` excluding type definitions
- **Environment**: Node test environment with ts-jest

### CI/CD Pipeline
- **GitHub Actions**: Automated testing on push/PR
- **Parallel jobs**: Quality checks run in parallel
- **E2E in CI**: Full browser test suite with retries
- **Performance monitoring**: Automated Lighthouse checks

## Key Libraries & Dependencies
- **Next.js 15**: App Router, Edge Runtime, Image Optimization
- **React 19**: Latest React with concurrent features
- **Tailwind CSS 4**: Utility-first styling with custom config
- **Resend**: Email sending and automation
- **PostHog**: Product analytics platform
- **@vercel/analytics**: Performance monitoring
- **Playwright**: E2E testing framework
- **Jest**: Unit testing framework
- **dotenv-cli**: Environment variable management

