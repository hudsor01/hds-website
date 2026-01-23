# External Integrations

**Analysis Date:** 2026-01-10

## Database

**Supabase PostgreSQL:**
- Connection: `@supabase/supabase-js` 2.90.1, `@supabase/ssr` 0.8.0
- Client creation:
  - Browser: `src/utils/supabase/client.ts` (SSR-compatible)
  - Server: `src/utils/supabase/server.ts` (Server Components with cookies)
  - Admin: `src/lib/supabase.ts` (service role for public data)
- Authentication: Built-in auth with SSR support, middleware refresh
- Middleware: None (auth checked in admin-auth.ts, session refresh via getUser() calls)
- Row Level Security: Enabled for multi-tenant data isolation
- Environment: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Email

**Resend:**
- Package: `resend` 6.6.0
- Integration: `src/lib/email/` (contact form handler)
- Sender: hello@hudsondigitalsolutions.com
- Templates: HTML email with proper headers
- Environment: `RESEND_API_KEY`
- Error handling: Logger integration for failed sends

## Analytics & Monitoring

**Vercel Analytics:**
- Package: `@vercel/analytics` 1.6.1
- Integration: `src/app/layout.tsx` (Analytics component)
- Events: Auto-tracked page views, custom events via logger
- CTA tracking: `src/components/CTAButton.tsx` (automatic click tracking)

**Vercel Speed Insights:**
- Package: `@vercel/speed-insights` 1.3.1
- Integration: `src/app/layout.tsx` (SpeedInsights component)
- Metrics: Core Web Vitals, performance monitoring

## Key-Value Storage

**Vercel KV (Redis):**
- Package: `@vercel/kv` 3.0.0
- Usage: Rate limiting implementation
- Integration: `src/lib/rate-limiter.ts`
- Environment: `KV_REST_API_URL`, `KV_REST_API_TOKEN` (auto-configured by Vercel)

## PDF Generation

**Puppeteer:**
- Package: `puppeteer` 24.34.0
- Integration: `src/lib/pdf/generator.ts`
- Usage: Headless Chrome for PDF rendering
- Templates: `@react-pdf/renderer` 4.3.2 for PDF layouts
- Directory: `src/lib/pdf/` (generator, templates)

## Webhooks

**Discord (Optional):**
- Integration: Contact form notifications
- Implementation: `src/app/api/contact/route.ts`
- Environment: `DISCORD_WEBHOOK_URL` (optional)
- Fallback: Gracefully skips if not configured

## Authentication

**Supabase Auth:**
- Provider: Email/password, OAuth providers (configurable)
- Session management: Cookie-based with middleware refresh
- Client types:
  - Browser: `createBrowserClient()` for client components
  - Server: `createServerClient()` for Server Components
  - Admin: Service role for background operations
- Protected routes: Middleware-based authentication check
- Configuration: RLS policies in Supabase dashboard

## Deployment

**Vercel Platform:**
- Hosting: Serverless functions, Edge runtime compatible
- Deployments: Automatic on main branch push
- Environment: Production variables managed in Vercel dashboard
- Build: Next.js production build with optimizations
- CDN: Global edge network for static assets

## Content Delivery

**Next.js Image Optimization:**
- Service: Vercel Image Optimization API
- Format: Automatic WebP conversion
- Caching: CDN-cached optimized images
- Lazy loading: Default for below-fold images
- Priority: Configurable for above-fold images

## Environment Variables

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Admin operations (server-side only)
- `RESEND_API_KEY` - Email sending
- `KV_REST_API_URL` - Rate limiting (auto-configured)
- `KV_REST_API_TOKEN` - Rate limiting (auto-configured)

**Optional:**
- `DISCORD_WEBHOOK_URL` - Contact form notifications
- `NEXT_PUBLIC_APP_URL` - Application base URL (default: http://localhost:3000)

**Validation:**
- Schema: `src/env.ts` via `@t3-oss/env-nextjs` 0.13.10
- Type-safe: Compile-time validation with Zod
- Namespaces: Separate server/client variable access
- Startup check: Build fails if required variables missing

## API Endpoints

**Internal:**
- `/api/contact` - Contact form submission (Resend integration)
- Webhooks: Framework ready for external webhook receivers
- Server Actions: `src/app/actions/` (form processing, data mutations)

**External Services:**
- Supabase API: Database queries, auth operations
- Resend API: Email delivery
- Vercel APIs: Analytics, Speed Insights, KV storage

## Rate Limiting

**Implementation:**
- Store: Vercel KV (Redis)
- Strategy: Token bucket algorithm
- Limits: Configurable per endpoint
- Integration: `src/lib/rate-limiter.ts`
- Protected routes: API routes, form submissions

---

*Integration audit: 2026-01-10*
*Update when adding/removing external services*
