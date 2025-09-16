# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## MANDATORY RULES - NO EXCEPTIONS

### NO EMOJIS RULE
- Never use emojis in communication unless user explicitly requests them
- Never use emojis in code, comments, or file content
- Use Lucide Icons or Heroicons instead for visual elements in UI components
- Keep all responses professional and emoji-free
- Focus on clear, direct technical communication

### CORE PRINCIPLES
- **DRY**: Search before writing (`rg "functionName"`). Consolidate code reused ≥2 places
- **KISS**: Choose simplest solution. Delete code instead of adding when possible
- **SOLID**: Single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion
- **NO ABSTRACTIONS**: Use native platform features directly. No wrappers, factories, or custom layers
- **PRODUCTION MINDSET**: Security first, platform-native, performance-conscious, reliability-focused

### NATIVE PLATFORM REPLACEMENTS
- **Auth**: Next.js Auth or simple session management
- **Storage**: Vercel Blob or native file handling
- **Email**: Resend API
- **Validation**: Zod schemas or native JavaScript validation
- **Data**: Native fetch API
- **Forms**: Native form handling or React Hook Form
- **State**: React useState/useReducer (avoid complex state management)
- **Styles**: Tailwind classes
- **Components**: Radix/ShadCN base components
- **Dates**: date-fns
- **HTTP**: Native fetch
- **Logging**: Unified logger with PostHog + Vercel integration (`@/lib/logger`)

### UI COMPONENT PATTERNS
- **Buttons**: Native button + Tailwind or Radix Button
- **Forms**: Native form elements + validation
- **Modals**: Radix Dialog when needed
- **Dropdowns**: Radix Select
- **Loading**: Simple CSS animations
- **Layouts**: CSS Grid + Flexbox + Tailwind
- **Animations**: Tailwind transitions (avoid complex animation libraries)
- **Themes**: CSS custom properties
- **Responsive**: Tailwind responsive prefixes

### BEFORE EVERY CHANGE
1. Does this exist? (Search first!)
2. Can I use native platform feature?
3. Can I delete code instead?
4. Is this the simplest solution?
5. Will another developer understand immediately?
6. Does this follow accessibility standards?
7. Is this predictable and consistent?

### LOGGING STANDARDS
- **NEVER use console.log/info/debug** - Use `logger` from `@/lib/logger`
- **Use structured logging**: Include context, user IDs, request IDs
- **PostHog Integration**: All logs become trackable analytics events
- **Vercel Integration**: Structured JSON logs in production dashboard
- **Error Tracking**: Rich error context with stack traces and user sessions

```typescript
import { logger } from '@/lib/logger';

// Replace console.log with:
logger.info('User action', { userId: 123, action: 'click' });
logger.error('API failed', error);
logger.debug('Debug info'); // Only in development

// Performance tracking:
logger.time('api-call');
// ... API call
logger.timeEnd('api-call'); // Tracked in PostHog

// Context for user sessions:
logger.setContext({ userId: 'user-123', plan: 'premium' });
```

## Development Commands

### Core Commands
- `npm run dev` - Start development server with .env.local (localhost:3000)
- `npm run build` - Build production application with .env.production
- `npm run build:local` - Build with .env.local for local testing
- `npm run build:analyze` - Build with bundle analyzer for performance optimization
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks
- `npm run typecheck` - Run TypeScript type checking

### Testing Commands
- `npm run test:unit` - Run Jest unit tests
- `npm run test:unit:watch` - Run Jest unit tests in watch mode
- `npm run test:unit:coverage` - Run Jest unit tests with coverage report
- `npm run test:e2e` - Run all Playwright e2e tests
- `npm run test:e2e:ui` - Run Playwright tests with UI mode
- `npm run test:e2e:fast` - Run fast e2e tests (chromium only)
- `npm run test:e2e:a11y` - Run accessibility-specific e2e tests
- `npm run test:e2e:report` - Show Playwright test report
- `npm run test:all` - Run lint, typecheck, unit tests, and fast e2e tests
- `npm run test:ci` - Full test suite for CI (includes all e2e tests)

### Development Workflow
- Use `npm run dev` for local development with hot reload
- Always run `npm run lint` and `npm run typecheck` before commits to ensure code quality
- Use `npm run test:all` to run all checks before pushing
- Use `npm run build:local` to verify production build works with your local environment

## Project Architecture

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Custom components with Heroicons
- **Email Service**: Resend for transactional emails
- **Analytics**: Google Analytics 4, PostHog, Vercel Analytics
- **CMS**: Ghost CMS for blog content
- **Calendar**: Cal.com integration
- **Performance**: Web Vitals tracking, Core Web Vitals optimization

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── (tools)/           # Route group for internal tools
│   │   └── paystub-generator/ # Paystub generator tool
│   ├── layout.tsx         # Root layout with fonts and metadata
│   ├── page.tsx           # Home page
│   ├── about/page.tsx     # About page
│   ├── contact/page.tsx   # Contact page
│   ├── services/page.tsx  # Services page
│   ├── portfolio/page.tsx # Portfolio showcase page
│   ├── pricing/page.tsx   # Pricing information page
│   ├── privacy/page.tsx   # Privacy policy page
│   ├── testimonials/page.tsx # Customer testimonials page
│   ├── resources/         # Lead magnets and resources
│   ├── blog/              # Blog pages with static content
│   │   ├── page.tsx       # Blog listing
│   │   └── [slug]/page.tsx # Individual blog posts
│   ├── robots.ts          # Dynamic robots.txt generation
│   ├── sitemap.ts         # Dynamic sitemap generation
│   └── api/               # API routes
│       ├── contact/route.ts # Contact form handler
│       ├── lead-magnet/route.ts # Lead magnet downloads
│       ├── process-emails/route.ts # Email processing
│       ├── csrf/route.ts  # CSRF token endpoint
│       └── rss/feed/route.ts # RSS feed generation
├── components/            # Reusable UI components
│   ├── layout/
│   │   ├── Navbar.tsx     # Main navigation (client component)
│   │   └── Footer.tsx     # Site footer
│   ├── ContactForm.tsx    # Contact form with validation and analytics
│   ├── CalendarWidget.tsx # Cal.com integration widget
│   ├── ThemeToggle.tsx    # Dark/light mode toggle
│   ├── Analytics.tsx      # Analytics tracking components
│   ├── AccessibilityProvider.tsx # Accessibility features provider
│   ├── CookieConsent.tsx  # GDPR cookie consent management
│   ├── ErrorBoundary.tsx  # React error boundary component
│   ├── LoadingStates.tsx  # Loading indicators and states
│   ├── ServiceWorkerRegistration.tsx # PWA service worker
│   └── WebVitalsReporting.tsx # Core Web Vitals monitoring
├── contexts/              # React contexts
│   └── ThemeContext.tsx   # Theme management
├── hooks/                 # Custom React hooks
│   └── useTouchInteractions.ts # Touch interaction handling
├── lib/                   # Core utilities and integrations
│   ├── analytics.ts       # Multi-platform analytics tracking
│   ├── seo.ts            # SEO configuration with schema markup
│   ├── email-sequences.ts # Automated email nurturing sequences
│   ├── ghost.ts          # Ghost CMS API integration
│   ├── posthog.ts        # PostHog analytics configuration
│   ├── image-loader.ts   # Next.js image optimization
│   └── analytics.ts.bak  # Backup of analytics configuration
├── types/                 # TypeScript type definitions
│   ├── seo.ts            # SEO metadata types and interfaces
│   ├── accessibility.ts  # Accessibility compliance types
│   ├── performance.ts    # Performance monitoring types
│   ├── components.ts     # Component prop and state types
│   └── ghost.d.ts        # Ghost CMS API response types
└── utils/                 # Utility functions
    ├── seo.ts            # SEO optimization utilities
    ├── accessibility.ts  # Accessibility helper functions
    ├── performance.ts    # Performance measurement utilities
    └── crawling.ts       # Web crawling and indexing utilities
tests/                     # Test files
├── unit/                  # Jest unit tests
│   ├── validation.test.ts # Form validation tests
│   ├── states.test.ts     # State management tests
│   └── storage.test.ts    # Storage utility tests
└── e2e/                   # Playwright end-to-end tests
    ├── form-functionality.spec.ts # Contact form tests
    ├── pdf-generation.spec.ts     # PDF generation tests
    └── localStorage-persistence.spec.ts # Storage persistence tests
```

### Key Architectural Patterns

#### Multi-Platform Analytics Integration
- **Google Analytics 4**: Page views, conversions, custom events
- **PostHog**: Product analytics, feature flags, session recordings
- **Vercel Analytics**: Core Web Vitals, speed insights
- Unified tracking through `src/lib/analytics.ts`
- Comprehensive event tracking: form submissions, scroll depth, time on page
- Web Vitals monitoring (LCP, FID, CLS) with automatic reporting

#### SEO and Performance Optimization
- Centralized SEO config in `src/lib/seo.ts`
- Rich schema markup (Organization, Service, LocalBusiness, Person)
- Dynamic keyword generation and meta descriptions
- OpenGraph and Twitter Card optimization
- Performance-first approach with Next.js Image optimization
- Core Web Vitals tracking and optimization

#### Email Marketing and Lead Nurturing
- Automated email sequences in `src/lib/email-sequences.ts`
- Multiple nurturing flows: welcome series, consultation follow-up, long-term nurturing
- Resend integration for transactional emails
- Lead scoring and high-intent detection
- Conversion tracking across all touchpoints

#### Content Management and Blog
- Static blog content (not Ghost CMS)
- Individual blog posts as static pages
- RSS feed generation via API route
- Static generation for optimal performance
- Lead magnet integration for downloads

#### Component Architecture
- **Layout Components**: Navbar, Footer in `src/components/layout/`
- **Form Components**: ContactForm with validation and analytics
- **Integration Components**: CalendarWidget, ThemeToggle
- **Client Components**: Use `"use client"` directive for interactive components
- **Server Components**: Default for static content and SEO

#### TypeScript Configuration
- Path aliases configured: `@/*` maps to `src/*`
- Strict TypeScript settings enabled
- Component-specific path aliases for better imports
- Comprehensive type definitions for all integrations

#### Styling and Theme System
- Tailwind CSS 4.x with custom theme configuration
- Dark/light mode support with system preference detection
- CSS custom properties for theming
- Responsive design patterns with mobile-first approach
- Custom gradient and glow effects for brand identity

#### Progressive Web App (PWA) Features
- Service worker registration for offline functionality
- Manifest.json configuration for app-like experience
- Caching strategies for improved performance
- Offline page fallback for network failures
- App icon and splash screen configurations

#### Cron Jobs and Background Processing
- Email queue processing via `/api/cron/process-email-queue`
- Automated sitemap updates via `/api/cron/update-sitemap`
- RSS feed generation at `/api/rss/feed`
- Background analytics data processing
- Scheduled maintenance tasks

### Business Context and Features
- **Company**: Hudson Digital Solutions
- **Brand Colors**: Cyan-based palette with gradients
- **Design Language**: Modern, tech-focused with terminal/coding aesthetics
- **Target Audience**: Businesses needing web development and digital solutions
- **Contact Form**: Sends to hello@hudsondigitalsolutions.com with automated nurturing
- **Calendar Integration**: Cal.com widget for consultation bookings
- **Lead Nurturing**: Automated email sequences for different user intents

### Development Guidelines
- Use Next.js App Router patterns (not Pages Router)
- Implement proper TypeScript types for all components
- Follow accessibility best practices with ARIA labels
- Optimize for SEO with structured data and metadata
- Use server components by default, client components only when needed
- Maintain responsive design across all screen sizes
- Follow the existing brand aesthetic and color scheme
- Always test contact form functionality before deployment
- Monitor Core Web Vitals and optimize for performance
- Use analytics tracking for all user interactions

### Environment Variables Required
```bash
# Email
RESEND_API_KEY=             # Resend API key for email sending

# Analytics & Monitoring
NEXT_PUBLIC_GA_MEASUREMENT_ID=  # Google Analytics 4 ID
GA4_API_SECRET=             # GA4 Measurement Protocol API secret
NEXT_PUBLIC_POSTHOG_KEY=    # PostHog project API key
NEXT_PUBLIC_POSTHOG_HOST=   # PostHog host (default: https://app.posthog.com)

# SEO
GOOGLE_SITE_VERIFICATION=   # Google Search Console verification

# Security
CSRF_SECRET=                # CSRF token secret for form security
```

### Configuration Files
- `next.config.ts` - Next.js configuration with image optimization and security headers
- `tsconfig.json` - TypeScript configuration with path aliases
- `eslint.config.mjs` - ESLint configuration using Next.js presets
- `postcss.config.mjs` - PostCSS configuration for Tailwind
- `tailwind.config.js` - Tailwind CSS configuration
- `vercel.json` - Vercel deployment configuration with performance optimizations

### Testing Strategy

#### Unit Testing
- Jest configured for unit tests in `tests/unit/`
- Tests for validation, state management, and utility functions
- Coverage reporting available with `npm run test:unit:coverage`
- Watch mode for development: `npm run test:unit:watch`

#### E2E Testing Setup
- Playwright configured for comprehensive end-to-end testing
- Tests in `tests/e2e/` directory
- Multi-browser testing (Chrome, Firefox, Safari)
- Mobile device testing (iPhone, Pixel)
- Accessibility testing with axe-core
- Performance and animation-specific test suites
- Visual regression testing capabilities

#### Performance Testing
- Core Web Vitals monitoring with automated reports
- Bundle analysis available with `ANALYZE=true npm run build`
- Performance regression testing included in CI/CD
- Real User Monitoring (RUM) data collection

### Performance and Monitoring
- Real User Monitoring (RUM) with Web Vitals tracking
- Performance budgets and optimization
- Error tracking and debugging
- Lead attribution and marketing campaign tracking
- Comprehensive analytics dashboard integration

### Key Development Patterns

#### File-based Routing Architecture
- Uses Next.js 15 App Router (not Pages Router)
- Route handlers in `app/api/` for server-side logic
- Dynamic routes: `[slug]` for blog posts, `[tag]` for blog tags
- Special files: `layout.tsx`, `page.tsx`, `robots.ts`, `sitemap.ts`
- Client components marked with `"use client"` directive

#### Data Flow and State Management
- Server components for static content and SEO optimization
- Client components for interactive features (forms, navigation)
- React Context for theme management (`ThemeContext.tsx`)
- Custom hooks for reusable stateful logic (`useTouchInteractions.ts`)
- Type-safe APIs with comprehensive TypeScript definitions

#### Integration Architecture
- Multi-platform analytics unified through `src/lib/analytics.ts`
- Email automation orchestrated via `src/lib/email-sequences.ts`
- Ghost CMS headless integration for blog content
- PostHog for advanced product analytics and feature flags
- Resend for transactional email delivery

#### Performance-First Design
- Static generation for blog posts and marketing pages
- Image optimization with Next.js Image component
- Bundle splitting and lazy loading strategies
- Edge caching and CDN optimization
- Core Web Vitals monitoring and optimization

## Memories and Development Notes

### Integration Strategies
- Route all memories to use mcp server supermemory

### Important Development Considerations
- Always test contact form functionality before deployment
- Monitor bundle size with analyzer (`ANALYZE=true npm run build`)
- Verify email sequences are working in production
- Check Core Web Vitals after significant changes
- Ensure accessibility compliance with screen readers