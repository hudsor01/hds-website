# External Integrations

**Analysis Date:** 2026-01-10
**Last Updated:** 2026-03-16

## Database

**Neon PostgreSQL:**
- Connection: `@neondatabase/serverless` with `drizzle-orm/neon-http` adapter
- Client: `src/lib/db.ts` (Drizzle ORM client)
- Schema: `src/lib/schemas/schema.ts` (Drizzle schema definitions)
- Queries: Type-safe Drizzle query builder (`db.select().from(table).where(...)`)
- Schema sync: `drizzle-kit push` (not migrate)
- Extensions: `hypopg` v1.4.2, `pg_cron` v1.6
- Environment: `POSTGRES_URL`, `DATABASE_URL_UNPOOLED` (for drizzle-kit)

## Email

**Resend:**
- Package: `resend`
- Integration: `src/lib/email/` (contact form handler)
- Sender: hello@hudsondigitalsolutions.com
- Templates: HTML email with proper headers
- Environment: `RESEND_API_KEY`
- Error handling: Logger integration for failed sends

## Analytics & Monitoring

**Vercel Analytics:**
- Package: `@vercel/analytics`
- Integration: `src/app/layout.tsx` (Analytics component)
- Events: Auto-tracked page views, custom events via logger

**Vercel Speed Insights:**
- Package: `@vercel/speed-insights`
- Integration: `src/app/layout.tsx` (SpeedInsights component)
- Metrics: Core Web Vitals, performance monitoring

## PDF Generation

**Puppeteer:**
- Integration: `src/lib/pdf/generator.ts`
- Usage: Headless Chrome for PDF rendering
- Templates: `@react-pdf/renderer` for PDF layouts

## Webhooks

**Discord (Optional):**
- Integration: Contact form notifications
- Implementation: `src/app/api/contact/route.ts`
- Environment: `DISCORD_WEBHOOK_URL` (optional)

## Deployment

**Vercel Platform:**
- Hosting: Serverless functions, Edge runtime compatible
- Deployments: Automatic on main branch push
- Environment: Production variables managed in Vercel dashboard
- CDN: Global edge network for static assets

## Content Delivery

**Next.js Image Optimization:**
- Service: Vercel Image Optimization API
- Format: Automatic WebP conversion
- Lazy loading: Default for below-fold images

## Environment Variables

**Required:**
- `POSTGRES_URL` - Neon PostgreSQL connection string (pooled)
- `DATABASE_URL_UNPOOLED` - Neon direct connection (for drizzle-kit)
- `RESEND_API_KEY` - Email sending
- `CRON_SECRET` - Bearer token for scheduled email queue endpoint

**Optional:**
- `DISCORD_WEBHOOK_URL` - Contact form notifications
- `NEXT_PUBLIC_APP_URL` - Application base URL

**Validation:**
- Schema: `src/env.ts` via `@t3-oss/env-nextjs`
- Type-safe: Compile-time validation with Zod
- Startup check: Build fails if required variables missing

## API Endpoints

**Internal:**
- `/api/contact` - Contact form submission (Resend integration)
- `/api/process-emails` - Scheduled email queue (protected with CRON_SECRET)
- Server Actions: `src/app/actions/` (form processing, data mutations)

**External Services:**
- Neon PostgreSQL: Database queries via Drizzle ORM
- Resend API: Email delivery
- Vercel APIs: Analytics, Speed Insights

---

*Integration audit: 2026-01-10*
*Updated: 2026-03-16 — reflects current Neon/Drizzle stack*
