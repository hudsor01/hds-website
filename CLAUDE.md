# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern business website for Hudson Digital Solutions built with Next.js 15, React 19, and TypeScript. It's a high-performance marketing site with integrated blog, contact forms, analytics, and automated email sequences.

## Development Commands

### Core Commands
```bash
# Development
npm run dev                # Start development server
npm run dev:https         # Start development server with HTTPS

# Build & Production
npm run build             # Production build
npm run build:analyze     # Build with bundle analyzer
npm run start             # Start production server

# Quality & Analysis
npm run lint              # ESLint checking
npm run check:bundle      # Analyze bundle size
npm run test:performance  # Run Lighthouse performance test
```

### Utility Commands
```bash
npm run generate-sitemap    # Generate sitemap.xml
npm run setup:https        # Setup local HTTPS certificates
npm run optimize:images    # Optimize images in public folder
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
- **Google Analytics 4**: Conversion tracking, custom events
- **PostHog**: Product analytics, feature flags, session recordings  
- **Vercel Analytics**: Core Web Vitals, performance monitoring
- **Custom Web Vitals**: Real user monitoring via API endpoint

#### Performance Optimization
- **Edge Runtime**: API routes use Edge Runtime where possible
- **Image Optimization**: WebP/AVIF formats with long caching
- **Code Splitting**: Modular imports for icons and components
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Caching Strategy**: Multi-level caching (CDN, browser, ISR)

### Ghost CMS Integration
Blog powered by headless Ghost CMS:
- **Content API**: Read-only integration via `@tryghost/content-api`
- **ISR**: Blog posts use Incremental Static Regeneration
- **SEO**: Dynamic sitemaps, schema markup, RSS feeds
- **Error Handling**: Graceful fallbacks when Ghost is unavailable

### Security & Headers
Comprehensive security implemented via:
- **Next.js config headers**: Security headers applied globally
- **Middleware**: Additional security and performance headers
- **HTTPS enforcement**: Production redirects, HSTS
- **CORS configuration**: API route protection
- **CSP**: Content Security Policy via Vercel config

## Environment Variables

### Required
```bash
RESEND_API_KEY=             # Email sending via Resend
GHOST_URL=                  # Ghost CMS instance URL
GHOST_CONTENT_API_KEY=      # Ghost Content API key (26 chars)
```

### Analytics & Monitoring
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=  # Google Analytics 4
GA4_API_SECRET=             # GA4 Measurement Protocol
NEXT_PUBLIC_POSTHOG_KEY=    # PostHog project API key
NEXT_PUBLIC_POSTHOG_HOST=   # PostHog host URL
```

### SEO & Verification
```bash
GOOGLE_SITE_VERIFICATION=   # Google Search Console
```

## Contact Form Flow
1. Form submission triggers `/api/contact` endpoint
2. **Validation**: Server-side validation with rate limiting  
3. **Email sending**: Admin notification + client welcome
4. **Lead scoring**: High-intent detection for consultation requests
5. **Sequence scheduling**: Automated nurturing emails via Resend
6. **Analytics**: Conversion events sent to GA4/PostHog

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
1. **Live site**: `/contact` page
2. **Test HTML**: `http://localhost:3000/test-contact-form.html`  
3. **Script**: `npx tsx test-contact-form.ts`

All emails sent to `hello@hudsondigitalsolutions.com`

## Key Libraries & Dependencies
- **Next.js 15**: App Router, Edge Runtime, Image Optimization
- **React 19**: Latest React with concurrent features
- **Tailwind CSS 4**: Utility-first styling with custom config
- **Ghost Content API**: Headless CMS integration
- **Resend**: Email sending and automation
- **PostHog**: Product analytics platform
- **@vercel/analytics**: Performance monitoring