# Phase 62: Cache Components Adoption - Research

**Researched:** 2026-04-26
**Domain:** Next.js 16 Cache Components — `'use cache'`, `cacheLife()`, `cacheTag()`, `updateTag()`
**Confidence:** HIGH (based on Next.js 16 official docs via Context7)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Function-level `'use cache'` on data-layer reads, NOT page-level `export const revalidate`
- Each cached function gets a domain-keyed `cacheTag()`
- Default `cacheLife()`: `'hours'` for lists, `'days'` for individual articles
- Pages drop their `export const revalidate` / `dynamic` directives — caching moves into the data layer

### Out of Scope
- `'use cache: remote'` (no multi-instance cache sharing yet)
- API route caching
- `connection()` calls (phase 63 territory)
</user_constraints>

<api_reference>
## Next.js 16 Cache Components API

### `'use cache'` directive
Mark a function (top-of-body) as cached. Next.js memoises the result keyed by the function's serialised arguments and any `cacheTag()` calls made within it.

```typescript
async function getBlogPosts() {
  'use cache'
  cacheLife('hours')
  cacheTag('blog-posts')

  return db.select().from(blogPosts)
}
```

Key properties:
- Function arguments must be JSON-serialisable (no class instances, no functions)
- The cached function still runs server-side; the cache layer just stores the *return value*
- Composes with React Server Components — call from a server component and the result is reused across requests
- For dynamic per-request data (cookies, headers), pass them as arguments OR defer to request time with a Suspense boundary (see streaming pattern below)

### `cacheLife(profile)`
Built-in profiles: `'seconds'`, `'minutes'`, `'hours'`, `'days'`, `'weeks'`, `'max'`. Custom: `{ stale: number, revalidate: number, expire: number }` (all in seconds).

```typescript
cacheLife('hours')                                    // built-in
cacheLife({ stale: 60, revalidate: 300, expire: 3600 }) // custom
```

`stale` = serve cached without revalidating; `revalidate` = serve stale but trigger background refresh; `expire` = treat as missing.

### `cacheTag(...tags)`
Attach one or more tags to the cached entry. Tags can be revalidated on-demand via `updateTag(tag)` (called from a server action or route handler). One cached function can have many tags.

```typescript
cacheTag('blog-posts')                  // list-level
cacheTag(`blog-post:${slug}`)           // item-level
cacheTag('blog-posts', `blog-tag:${t}`) // multiple
```

### `updateTag(tag)` (from server action / route handler)
```typescript
import { updateTag } from 'next/cache'

async function publishPost(formData: FormData) {
  'use server'
  await db.insert(blogPosts).values({ ... })
  updateTag('blog-posts')
}
```

### Pages no longer need `export const revalidate`
When the data layer is `'use cache'`-wrapped, the page just calls the function and inherits its cache lifecycle. Remove the page-level directive.

For pages that genuinely need to render at request time (cookies, request headers), use `Suspense` with a streamed dynamic component:

```tsx
export default function Page() {
  return (
    <>
      <CachedShell />
      <Suspense fallback={<Skeleton />}>
        <DynamicPart />
      </Suspense>
    </>
  )
}

async function DynamicPart() {
  const session = (await cookies()).get('session')?.value
  // ...
}
```

</api_reference>

<integration_with_drizzle>
## Drizzle Integration Notes

The data layer files in this codebase wrap Drizzle queries. `'use cache'` works transparently — the directive is on the wrapping function, not the query itself.

Caveats:
- Drizzle returns plain objects (or arrays of plain objects) — JSON-serialisable, cache-safe.
- Date columns return JS `Date` objects, which serialise to ISO strings on cache hit and back on read. If any consumer relies on `instanceof Date`, this will break — verify by `grep -rn "instanceof Date" src/lib/blog.ts src/lib/showcase.ts src/lib/help-articles.ts` before scoping.
- The mock DB used in dev when `POSTGRES_URL` is unset (`src/lib/db.ts`) returns the same shape — caching behaviour is identical.
</integration_with_drizzle>

<test_strategy>
## How to Verify Cache Hits in This Codebase

1. `bun run build` then `bun run start` (production mode)
2. Watch the build output route table for the cached pages — they should report `(Cache)` or static
3. `curl -sI http://localhost:3000/blog` — should show fast TTFB on second request
4. Explicit: add `console.log` (temporarily) inside a cached function, hit the page twice, confirm log fires only once

`bun:test` unit tests for the data layer must NOT break — `'use cache'` is transparent at the function level. If a test mocks the function it will still work; if a test imports the function and calls it directly, the cache behaviour applies but doesn't affect correctness (same return value).
</test_strategy>

<risks>
## Risks & Decisions Needed

- **`force-dynamic` on help articles** — line 31 of `src/app/help/[category]/[slug]/page.tsx`. Audit before plan 02: is there a reason help articles must render dynamically per request? If no (likely), remove the directive and cache.
- **Drizzle Date round-tripping** — verify no consumer uses `instanceof Date`. Likely safe but cheap to confirm.
- **n8n blog-publish hook** — if a write path exists, plan 02 should add `updateTag('blog-posts')` after the insert. If no such hook exists in src/app/api/, the tags are reserved for future use and no invalidation hook is added yet.
</risks>
