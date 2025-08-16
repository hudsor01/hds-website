# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern business website for Hudson Digital Solutions built with Next.js 15, React 19, and TypeScript. It's a high-performance marketing site with contact forms, analytics, and automated email sequences.

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
npm run typecheck         # TypeScript type checking
npm run check:bundle      # Analyze bundle size
```

### Utility Commands
```bash
npm run generate-sitemap    # Generate sitemap.xml
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
1. **Live site**: `/contact` page
2. **Test HTML**: `http://localhost:3000/test-contact-form.html`  
3. **Script**: `npx tsx test-contact-form.ts`

All emails sent to `hello@hudsondigitalsolutions.com`

## Key Libraries & Dependencies
- **Next.js 15**: App Router, Edge Runtime, Image Optimization
- **React 19**: Latest React with concurrent features
- **Tailwind CSS 4**: Utility-first styling with custom config
- **Resend**: Email sending and automation
- **PostHog**: Product analytics platform
- **@vercel/analytics**: Performance monitoring

## n8n Email Queue Integration

### n8n Workflow JSON Structure
- **Required fields**: Each node needs `id` (UUID format), `name`, `type`, `typeVersion`, `position` [x,y], `parameters`
- **Node types format**: `n8n-nodes-base.nodeName` (e.g., `n8n-nodes-base.webhook`)
- **Connections structure**: `'SourceNode': {'main': [[{'node': 'TargetNode', 'type': 'main', 'index': 0}]]}`
- **Workflow structure**: Must include `meta{instanceId}`, `nodes[]`, `connections{}`, `active`, `settings`, `versionId`, `id`, `tags`
- **Common import error**: "undefined is not a function" indicates malformed JSON structure

### n8n Node Configuration Patterns
- **Webhook node**: `path` parameter, `responseMode: 'responseNode'`, `webhookId` matches path
- **IF node**: Works better than Switch for simple conditions in n8n workflows
- **EmailSend node**: Requires SMTP credentials, uses `resource: 'email'`, `operation: 'send'`
- **Wait node**: `amount` and `unit` parameters for delays
- **Set node**: `values` object with `boolean/string` arrays for data manipulation
- **Respond to Webhook**: `respondWith: 'allIncomingItems'` to return processed data

### Email Queue Workflow Architecture
- **Request format**: Webhook receives JSON with `action: 'send'|'schedule'` and `email` object
- **Routing logic**: IF condition routes immediate vs scheduled emails based on action parameter
- **Immediate path**: Webhook → IF → Send Email → Set Success → Respond
- **Scheduled path**: Webhook → IF → Wait → Send Scheduled Email → Set Schedule Success → Respond
- **Response format**: Both paths return `{success: true, message: 'descriptive text'}`
- **Email structure**: `{from, to, subject, html}` with fallback values

### n8n Integration Best Practices
- **Node IDs**: Always use UUID format to prevent import errors
- **Node positioning**: Use adequate spacing with `[x,y]` coordinates for visual layout
- **Compatibility**: Include `typeVersion` for all nodes to ensure compatibility
- **Stability**: Use built-in nodes (emailSend) over community nodes (resend) when possible
- **Response handling**: Set proper `responseMode` on webhook to control response behavior
- **Testing approach**: Start with minimal structure, then add complexity incrementally

### Working n8n Configuration
- **Location**: `/docs/n8n-email-queue-workflow.json` - Successfully tested and imported
- **Webhook URL**: `https://n8n.thehudsonfam.com/webhook/email-queue`
- **API Key**: Configured in `.env.local` as `N8N_API_KEY`
- **Credentials**: Requires SMTP setup in n8n for EmailSend nodes