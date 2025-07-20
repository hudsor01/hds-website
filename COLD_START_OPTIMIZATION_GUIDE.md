# Vercel Cold Start Optimization Guide

## Current Issues & Solutions

### 1. SSL Certificate Errors
The SSL errors you're experiencing are preventing resources from loading. Here are the fixes:

**Immediate Actions:**
1. Update `next.config.ts` to `next.config.mjs` (created above) with proper SSL headers
2. Ensure all resources use HTTPS in production
3. Add security headers and force HTTPS redirect

### 2. Cold Start Analysis

**Current Vulnerabilities:**
- All pages are dynamically rendered (no `export const dynamic` declarations)
- API routes use Node.js runtime instead of Edge
- No function warming strategy
- Large bundle sizes with unoptimized imports
- Ghost CMS calls on every request

## Optimization Strategies Implemented

### 1. Route Optimization

**Static Routes (No Cold Starts):**
```typescript
// Add to pages that rarely change
export const dynamic = 'force-static';
export const revalidate = 3600; // ISR - revalidate hourly
```

**Edge Runtime Routes (Minimal Cold Starts):**
```typescript
// For API routes and dynamic pages
export const runtime = 'edge';
```

### 2. Function Configuration

**Updated `vercel.json`:**
- Configured memory limits (256-512MB)
- Set appropriate max durations
- Added cron job for function warming
- Specified Node.js 20.x runtime

### 3. Bundle Optimization

**Next.js Config Updates:**
- Enabled PPR (Partial Prerendering)
- Optimized package imports
- Configured aggressive code splitting
- Enabled SWC minification
- Added standalone output mode

### 4. Caching Strategy

**Implemented Multi-Layer Caching:**
1. **CDN Edge Caching**: Static assets cached for 1 year
2. **Stale-While-Revalidate**: Blog posts serve stale content while revalidating
3. **Browser Caching**: Aggressive cache headers for static resources
4. **ISR**: Incremental Static Regeneration for blog posts

### 5. Middleware Optimizations

**Edge Middleware Features:**
- Runs on Edge Runtime (no cold starts)
- Adds security headers
- Implements geo-routing
- Preloads critical resources
- Forces HTTPS in production

### 6. Database/External API Optimization

**Ghost CMS Optimization:**
```typescript
// Implement caching layer
const ghostCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getCachedPost(slug: string) {
  const cached = ghostCache.get(slug);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  
  const post = await api.posts.read({ slug });
  ghostCache.set(slug, {
    data: post,
    expires: Date.now() + CACHE_TTL
  });
  
  return post;
}
```

### 7. Function Warming

**Automated Warming Strategy:**
1. Created `/api/warm` endpoint on Edge Runtime
2. Configured cron job to hit endpoint every 5 minutes
3. Minimal payload to keep functions warm

### 8. Image Optimization

**Next.js Image Config:**
- WebP and AVIF formats
- Multiple device sizes
- 1-year cache TTL
- Lazy loading by default

## Implementation Checklist

### Immediate Actions (SSL Fix):
- [ ] Replace `next.config.ts` with `next.config.mjs`
- [ ] Run `npm run build` to verify no errors
- [ ] Deploy to Vercel

### Phase 1 - Quick Wins (1-2 hours):
- [ ] Add `export const dynamic = 'force-static'` to static pages
- [ ] Convert `/api/contact` to Edge Runtime
- [ ] Implement middleware.ts
- [ ] Update vercel.json with optimized config

### Phase 2 - Route Optimization (2-4 hours):
- [ ] Add ISR to blog posts with `revalidate`
- [ ] Implement `generateStaticParams` for all dynamic routes
- [ ] Convert simple API routes to Edge Runtime
- [ ] Add caching headers to all routes

### Phase 3 - External Dependencies (4-6 hours):
- [ ] Implement Ghost CMS caching layer
- [ ] Add Redis/KV store for API caching
- [ ] Optimize Resend email sending
- [ ] Batch analytics calls

### Phase 4 - Advanced Optimization (Optional):
- [ ] Implement service worker for offline support
- [ ] Add resource hints (prefetch, preconnect, dns-prefetch)
- [ ] Use Vercel's Edge Config for feature flags
- [ ] Implement database connection pooling

## Monitoring & Metrics

### Key Metrics to Track:
1. **Cold Start Duration**: Target < 100ms for Edge, < 500ms for Node.js
2. **Time to First Byte (TTFB)**: Target < 200ms
3. **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
4. **Function Invocation Count**: Monitor for optimization opportunities
5. **Cache Hit Rate**: Target > 80% for static content

### Monitoring Tools:
- Vercel Analytics (built-in)
- Google Analytics 4 (configured)
- PostHog (configured)
- Web Vitals reporting endpoint

## Performance Testing

### Test Cold Starts:
```bash
# Test cold start performance
for i in {1..10}; do
  curl -w "@curl-format.txt" -o /dev/null -s https://hudsondigitalsolutions.com
  sleep 30 # Wait for function to go cold
done
```

### Create `curl-format.txt`:
```
time_namelookup:  %{time_namelookup}s\n
time_connect:  %{time_connect}s\n
time_appconnect:  %{time_appconnect}s\n
time_pretransfer:  %{time_pretransfer}s\n
time_redirect:  %{time_redirect}s\n
time_starttransfer:  %{time_starttransfer}s\n
time_total:  %{time_total}s\n
```

## Expected Results

### Before Optimization:
- Cold start: 1-3 seconds
- TTFB: 500-1500ms
- Bundle size: > 1MB

### After Optimization:
- Cold start: 50-500ms (depending on route)
- TTFB: 50-200ms
- Bundle size: < 500KB per route
- 80%+ cache hit rate

## Rollback Plan

If issues occur:
1. Revert to original `next.config.ts`
2. Remove middleware.ts
3. Restore original vercel.json
4. Remove route-level exports

## Additional Resources

- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [Next.js ISR](https://nextjs.org/docs/pages/building-your-application/data-fetching/incremental-static-regeneration)
- [Web Vitals](https://web.dev/vitals/)
- [Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)