# Error Monitoring System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement server-side error monitoring with Supabase storage, admin panel viewing, Grafana dashboards, and Alertmanager email digests.

**Architecture:** Enhanced logger captures server errors and pushes to Supabase `error_logs` table with fingerprinting for grouping. Admin panel at `/admin/errors` provides viewing/filtering. Grafana queries Supabase for dashboards, Alertmanager sends grouped email alerts.

**Tech Stack:** Next.js 16, Supabase (PostgreSQL + Auth), Grafana, Alertmanager, Vitest for testing

---

## Task 1: Fix ADMIN_EMAILS Validation (P0 Security)

**Files:**
- Modify: `src/lib/admin-auth.ts`
- Create: `tests/integration/admin-auth.test.ts`

**Step 1: Write the failing test for missing ADMIN_EMAILS**

```typescript
// tests/integration/admin-auth.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Admin Authentication', () => {
  const originalEnv = process.env.ADMIN_EMAILS

  afterEach(() => {
    process.env.ADMIN_EMAILS = originalEnv
  })

  describe('ADMIN_EMAILS validation', () => {
    it('throws error when ADMIN_EMAILS is undefined', async () => {
      delete process.env.ADMIN_EMAILS

      // Dynamic import to test module initialization
      await expect(async () => {
        vi.resetModules()
        await import('@/lib/admin-auth')
      }).rejects.toThrow('ADMIN_EMAILS environment variable is required')
    })

    it('throws error when ADMIN_EMAILS is empty string', async () => {
      process.env.ADMIN_EMAILS = ''

      await expect(async () => {
        vi.resetModules()
        await import('@/lib/admin-auth')
      }).rejects.toThrow('ADMIN_EMAILS environment variable is required')
    })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `bun test tests/integration/admin-auth.test.ts`
Expected: FAIL - currently no validation exists

**Step 3: Add ADMIN_EMAILS validation to admin-auth.ts**

Add at top of file after imports:

```typescript
// Fail fast if ADMIN_EMAILS not configured
if (!process.env.ADMIN_EMAILS?.trim()) {
  throw new Error('ADMIN_EMAILS environment variable is required')
}

const ADMIN_EMAILS = process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
```

**Step 4: Run test to verify it passes**

Run: `bun test tests/integration/admin-auth.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/admin-auth.ts tests/integration/admin-auth.test.ts
git commit -m "fix(security): add ADMIN_EMAILS environment validation (P0)"
```

---

## Task 2: Create error_logs Database Migration

**Files:**
- Create: `supabase/migrations/20251220000001_create_error_logs.sql`

**Step 1: Write the migration file**

```sql
-- supabase/migrations/20251220000001_create_error_logs.sql

-- Error logs table for application error monitoring
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Error classification
  level TEXT NOT NULL CHECK (level IN ('error', 'fatal')),
  error_type TEXT NOT NULL,
  fingerprint TEXT NOT NULL,

  -- Error details
  message TEXT NOT NULL,
  stack_trace TEXT,

  -- Request context
  url TEXT,
  method TEXT,
  route TEXT,
  request_id TEXT,

  -- User context (optional)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,

  -- Environment
  environment TEXT NOT NULL DEFAULT 'production',
  vercel_region TEXT,

  -- Flexible metadata
  metadata JSONB DEFAULT '{}',

  -- Resolution tracking
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT
);

-- Indexes for common query patterns
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_fingerprint ON error_logs(fingerprint);
CREATE INDEX idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX idx_error_logs_level ON error_logs(level);
CREATE INDEX idx_error_logs_route ON error_logs(route);
CREATE INDEX idx_error_logs_unresolved ON error_logs(created_at DESC) WHERE resolved_at IS NULL;

-- Enable RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can insert (used by logger)
CREATE POLICY "Service role can insert errors"
  ON error_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Service role can read all (used by admin API)
CREATE POLICY "Service role can read errors"
  ON error_logs FOR SELECT
  TO service_role
  USING (true);

-- Policy: Service role can update (mark resolved)
CREATE POLICY "Service role can update errors"
  ON error_logs FOR UPDATE
  TO service_role
  USING (true);

-- Comment for documentation
COMMENT ON TABLE error_logs IS 'Application error logs for monitoring and debugging';
COMMENT ON COLUMN error_logs.fingerprint IS 'Hash of error_type + message + first stack frame for grouping identical errors';
```

**Step 2: Apply the migration**

Run: `bunx supabase db push`
Expected: Migration applied successfully

**Step 3: Verify table exists**

Run: `bunx supabase db dump --schema public | grep error_logs`
Expected: Shows CREATE TABLE error_logs

**Step 4: Commit**

```bash
git add supabase/migrations/20251220000001_create_error_logs.sql
git commit -m "feat(db): add error_logs table for error monitoring"
```

---

## Task 3: Create Error Logger Types

**Files:**
- Create: `src/types/error-logging.ts`

**Step 1: Write the types file**

```typescript
// src/types/error-logging.ts

export type ErrorLevel = 'error' | 'fatal'

export interface ErrorContext {
  url?: string
  method?: string
  route?: string
  requestId?: string
  userId?: string
  userEmail?: string
  metadata?: Record<string, unknown>
}

export interface ErrorLogPayload {
  level: ErrorLevel
  error_type: string
  fingerprint: string
  message: string
  stack_trace?: string
  url?: string
  method?: string
  route?: string
  request_id?: string
  user_id?: string
  user_email?: string
  environment: string
  vercel_region?: string
  metadata: Record<string, unknown>
}

export interface ErrorLogRecord extends ErrorLogPayload {
  id: string
  created_at: string
  resolved_at?: string
  resolved_by?: string
}

export interface GroupedError {
  fingerprint: string
  error_type: string
  message: string
  level: ErrorLevel
  count: number
  first_seen: string
  last_seen: string
  route?: string
  resolved_at?: string
}

export interface ErrorStats {
  total_errors: number
  unique_types: number
  fatal_count: number
  resolved_count: number
  unresolved_count: number
}
```

**Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

**Step 3: Commit**

```bash
git add src/types/error-logging.ts
git commit -m "feat(types): add error logging type definitions"
```

---

## Task 4: Enhance Logger with Supabase Push

**Files:**
- Modify: `src/lib/logger.ts`
- Create: `tests/unit/logger.test.ts`

**Step 1: Write failing tests for enhanced logger**

```typescript
// tests/unit/logger.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Supabase before importing logger
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null })
    }))
  }
}))

describe('Logger', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('generateFingerprint', () => {
    it('generates consistent fingerprint for same error', async () => {
      const { generateFingerprint } = await import('@/lib/logger')

      const fp1 = generateFingerprint('TypeError', 'Cannot read property', 'at foo (file.ts:10)')
      const fp2 = generateFingerprint('TypeError', 'Cannot read property', 'at foo (file.ts:10)')

      expect(fp1).toBe(fp2)
    })

    it('generates different fingerprint for different errors', async () => {
      const { generateFingerprint } = await import('@/lib/logger')

      const fp1 = generateFingerprint('TypeError', 'Cannot read property', 'at foo (file.ts:10)')
      const fp2 = generateFingerprint('ReferenceError', 'x is not defined', 'at bar (other.ts:20)')

      expect(fp1).not.toBe(fp2)
    })
  })

  describe('logger.error', () => {
    it('logs to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { logger } = await import('@/lib/logger')

      logger.error('Test error', new Error('Test'))

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('includes context in Supabase payload', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase')
      const { logger } = await import('@/lib/logger')

      const insertMock = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(supabaseAdmin.from).mockReturnValue({ insert: insertMock } as any)

      await logger.error('Test error', new Error('Test'), {
        route: '/api/test',
        method: 'POST'
      })

      // Give async push time to complete
      await new Promise(r => setTimeout(r, 10))

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          route: '/api/test',
          method: 'POST'
        })
      )
    })
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `bun test tests/unit/logger.test.ts`
Expected: FAIL - generateFingerprint not exported, context not captured

**Step 3: Enhance logger.ts**

```typescript
// src/lib/logger.ts
import { supabaseAdmin } from '@/lib/supabase'
import type { ErrorContext, ErrorLogPayload } from '@/types/error-logging'

/**
 * Generate a fingerprint for grouping identical errors.
 * Hash of: error_type + message + first stack frame
 */
export function generateFingerprint(
  errorType: string,
  message: string,
  stack?: string
): string {
  const firstFrame = stack?.split('\n')[1]?.trim() || 'unknown'
  const input = `${errorType}:${message}:${firstFrame}`

  // Simple hash using btoa (available in Node 16+)
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36).padStart(8, '0')
}

/**
 * Push error to Supabase (non-blocking, fire-and-forget)
 */
async function pushToSupabase(payload: ErrorLogPayload): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from('error_logs').insert(payload)
    if (error) {
      console.error('[Logger] Failed to push to Supabase:', error.message)
    }
  } catch (e) {
    // Never throw - logging should not break the app
    console.error('[Logger] Failed to push to Supabase:', e)
  }
}

function formatMessage(level: string, message: string): string {
  const timestamp = new Date().toISOString()
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    console.log(formatMessage('info', message), meta || '')
  },

  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatMessage('debug', message), meta || '')
    }
  },

  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(formatMessage('warn', message), meta || '')
  },

  error: (message: string, error?: Error, context?: ErrorContext) => {
    const errorType = error?.name || 'UnknownError'
    const stack = error?.stack

    // Always log to console for Vercel logs
    console.error(formatMessage('error', message), {
      error: error?.message,
      stack,
      ...context
    })

    // Push to Supabase in production (non-blocking)
    if (process.env.NODE_ENV === 'production') {
      const payload: ErrorLogPayload = {
        level: 'error',
        error_type: errorType,
        fingerprint: generateFingerprint(errorType, message, stack),
        message,
        stack_trace: stack,
        url: context?.url,
        method: context?.method,
        route: context?.route,
        request_id: context?.requestId || crypto.randomUUID(),
        user_id: context?.userId,
        user_email: context?.userEmail,
        environment: 'production',
        vercel_region: process.env.VERCEL_REGION,
        metadata: context?.metadata || {}
      }

      // Fire and forget - don't await
      pushToSupabase(payload)
    }
  },

  fatal: (message: string, error?: Error, context?: ErrorContext) => {
    const errorType = error?.name || 'FatalError'
    const stack = error?.stack

    console.error(formatMessage('fatal', message), {
      error: error?.message,
      stack,
      ...context
    })

    if (process.env.NODE_ENV === 'production') {
      const payload: ErrorLogPayload = {
        level: 'fatal',
        error_type: errorType,
        fingerprint: generateFingerprint(errorType, message, stack),
        message,
        stack_trace: stack,
        url: context?.url,
        method: context?.method,
        route: context?.route,
        request_id: context?.requestId || crypto.randomUUID(),
        user_id: context?.userId,
        user_email: context?.userEmail,
        environment: 'production',
        vercel_region: process.env.VERCEL_REGION,
        metadata: context?.metadata || {}
      }

      pushToSupabase(payload)
    }
  }
}
```

**Step 4: Run tests to verify they pass**

Run: `bun test tests/unit/logger.test.ts`
Expected: PASS

**Step 5: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

**Step 6: Commit**

```bash
git add src/lib/logger.ts tests/unit/logger.test.ts
git commit -m "feat(logger): add Supabase error push with fingerprinting"
```

---

## Task 5: Create Errors API Route (List)

**Files:**
- Create: `src/app/api/admin/errors/route.ts`
- Create: `src/lib/schemas/error-logs.ts`

**Step 1: Create Zod schema for query params**

```typescript
// src/lib/schemas/error-logs.ts
import { z } from 'zod'

export const errorLogsQuerySchema = z.object({
  timeRange: z.enum(['1h', '24h', '7d', '30d']).default('24h'),
  errorType: z.string().optional(),
  route: z.string().optional(),
  level: z.enum(['error', 'fatal']).optional(),
  search: z.string().optional(),
  resolved: z.enum(['true', 'false', 'all']).default('all'),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0)
})

export type ErrorLogsQuery = z.infer<typeof errorLogsQuerySchema>

export const resolveErrorSchema = z.object({
  fingerprint: z.string().min(1),
  resolved: z.boolean()
})
```

**Step 2: Create the API route**

```typescript
// src/app/api/admin/errors/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { errorLogsQuerySchema } from '@/lib/schemas/error-logs'
import { logger } from '@/lib/logger'
import type { GroupedError, ErrorStats } from '@/types/error-logging'

const TIME_RANGE_MS: Record<string, number> = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000
}

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Parse and validate query params
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const parseResult = errorLogsQuerySchema.safeParse(searchParams)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const { timeRange, errorType, route, level, search, resolved, limit, offset } = parseResult.data
    const since = new Date(Date.now() - TIME_RANGE_MS[timeRange]).toISOString()

    // Build query for grouped errors
    let query = supabaseAdmin
      .from('error_logs')
      .select('fingerprint, error_type, message, level, route, resolved_at, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })

    if (errorType) {
      query = query.eq('error_type', errorType)
    }
    if (route) {
      query = query.eq('route', route)
    }
    if (level) {
      query = query.eq('level', level)
    }
    if (search) {
      query = query.ilike('message', `%${search}%`)
    }
    if (resolved === 'true') {
      query = query.not('resolved_at', 'is', null)
    } else if (resolved === 'false') {
      query = query.is('resolved_at', null)
    }

    const { data: rawErrors, error: queryError } = await query

    if (queryError) {
      logger.error('Failed to fetch errors', queryError as Error, { route: '/api/admin/errors' })
      return NextResponse.json({ error: 'Failed to fetch errors' }, { status: 500 })
    }

    // Group by fingerprint
    const groupedMap = new Map<string, GroupedError>()

    for (const err of rawErrors || []) {
      const existing = groupedMap.get(err.fingerprint)
      if (existing) {
        existing.count++
        if (err.created_at < existing.first_seen) {
          existing.first_seen = err.created_at
        }
        if (err.created_at > existing.last_seen) {
          existing.last_seen = err.created_at
        }
      } else {
        groupedMap.set(err.fingerprint, {
          fingerprint: err.fingerprint,
          error_type: err.error_type,
          message: err.message,
          level: err.level,
          route: err.route,
          count: 1,
          first_seen: err.created_at,
          last_seen: err.created_at,
          resolved_at: err.resolved_at
        })
      }
    }

    // Convert to array and sort by last_seen
    const grouped = Array.from(groupedMap.values())
      .sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime())
      .slice(offset, offset + limit)

    // Get stats
    const stats: ErrorStats = {
      total_errors: rawErrors?.length || 0,
      unique_types: new Set(rawErrors?.map(e => e.error_type)).size,
      fatal_count: rawErrors?.filter(e => e.level === 'fatal').length || 0,
      resolved_count: rawErrors?.filter(e => e.resolved_at).length || 0,
      unresolved_count: rawErrors?.filter(e => !e.resolved_at).length || 0
    }

    return NextResponse.json({
      errors: grouped,
      stats,
      pagination: {
        limit,
        offset,
        total: groupedMap.size
      }
    })
  } catch (error) {
    logger.error('Unexpected error in errors API', error as Error, { route: '/api/admin/errors' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 3: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

**Step 4: Commit**

```bash
git add src/app/api/admin/errors/route.ts src/lib/schemas/error-logs.ts
git commit -m "feat(api): add admin errors list endpoint with grouping"
```

---

## Task 6: Create Errors API Route (Detail + Resolve)

**Files:**
- Create: `src/app/api/admin/errors/[fingerprint]/route.ts`

**Step 1: Create the detail/resolve API route**

```typescript
// src/app/api/admin/errors/[fingerprint]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ fingerprint: string }>
}

// GET: Fetch error details and all occurrences
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdminAuth(request)
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { fingerprint } = await params

    const { data: errors, error } = await supabaseAdmin
      .from('error_logs')
      .select('*')
      .eq('fingerprint', fingerprint)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      logger.error('Failed to fetch error details', error as Error, {
        route: '/api/admin/errors/[fingerprint]',
        metadata: { fingerprint }
      })
      return NextResponse.json({ error: 'Failed to fetch error details' }, { status: 500 })
    }

    if (!errors || errors.length === 0) {
      return NextResponse.json({ error: 'Error not found' }, { status: 404 })
    }

    // Get the most recent occurrence for primary details
    const latest = errors[0]

    return NextResponse.json({
      fingerprint,
      error_type: latest.error_type,
      message: latest.message,
      level: latest.level,
      stack_trace: latest.stack_trace,
      route: latest.route,
      resolved_at: latest.resolved_at,
      resolved_by: latest.resolved_by,
      count: errors.length,
      first_seen: errors[errors.length - 1].created_at,
      last_seen: latest.created_at,
      occurrences: errors.map(e => ({
        id: e.id,
        created_at: e.created_at,
        url: e.url,
        method: e.method,
        user_email: e.user_email,
        vercel_region: e.vercel_region,
        metadata: e.metadata
      }))
    })
  } catch (error) {
    logger.error('Unexpected error fetching error details', error as Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH: Mark error as resolved/unresolved
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdminAuth(request)
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { fingerprint } = await params

    const bodySchema = z.object({
      resolved: z.boolean()
    })

    const body = await request.json()
    const parseResult = bodySchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { resolved } = parseResult.data
    const resolvedAt = resolved ? new Date().toISOString() : null
    const resolvedBy = resolved ? authResult.user.email : null

    const { error } = await supabaseAdmin
      .from('error_logs')
      .update({
        resolved_at: resolvedAt,
        resolved_by: resolvedBy
      })
      .eq('fingerprint', fingerprint)

    if (error) {
      logger.error('Failed to update error status', error as Error, {
        route: '/api/admin/errors/[fingerprint]',
        metadata: { fingerprint, resolved }
      })
      return NextResponse.json({ error: 'Failed to update error' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      resolved,
      resolved_at: resolvedAt,
      resolved_by: resolvedBy
    })
  } catch (error) {
    logger.error('Unexpected error updating error', error as Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

**Step 3: Commit**

```bash
git add src/app/api/admin/errors/[fingerprint]/route.ts
git commit -m "feat(api): add error detail and resolve endpoints"
```

---

## Task 7: Create Admin Errors Page Components

**Files:**
- Create: `src/components/admin/errors/ErrorStats.tsx`
- Create: `src/components/admin/errors/ErrorFilters.tsx`
- Create: `src/components/admin/errors/ErrorList.tsx`
- Create: `src/components/admin/errors/ErrorDetailModal.tsx`

**Step 1: Create ErrorStats component**

```typescript
// src/components/admin/errors/ErrorStats.tsx
'use client'

import { MetricCard } from '@/components/admin/MetricCard'
import type { ErrorStats as ErrorStatsType } from '@/types/error-logging'

interface ErrorStatsProps {
  stats: ErrorStatsType
  isLoading?: boolean
}

export function ErrorStats({ stats, isLoading }: ErrorStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        title="Total Errors"
        value={stats.total_errors}
        isLoading={isLoading}
      />
      <MetricCard
        title="Unique Types"
        value={stats.unique_types}
        isLoading={isLoading}
      />
      <MetricCard
        title="Fatal"
        value={stats.fatal_count}
        isLoading={isLoading}
        variant={stats.fatal_count > 0 ? 'danger' : 'default'}
      />
      <MetricCard
        title="Unresolved"
        value={stats.unresolved_count}
        isLoading={isLoading}
        variant={stats.unresolved_count > 0 ? 'warning' : 'success'}
      />
    </div>
  )
}
```

**Step 2: Create ErrorFilters component**

```typescript
// src/components/admin/errors/ErrorFilters.tsx
'use client'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface ErrorFiltersProps {
  timeRange: string
  onTimeRangeChange: (range: string) => void
  errorType: string
  onErrorTypeChange: (type: string) => void
  search: string
  onSearchChange: (search: string) => void
  errorTypes: string[]
}

const TIME_RANGES = [
  { value: '1h', label: 'Last hour' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' }
]

export function ErrorFilters({
  timeRange,
  onTimeRangeChange,
  errorType,
  onErrorTypeChange,
  search,
  onSearchChange,
  errorTypes
}: ErrorFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <select
        value={timeRange}
        onChange={(e) => onTimeRangeChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
      >
        {TIME_RANGES.map((range) => (
          <option key={range.value} value={range.value}>
            {range.label}
          </option>
        ))}
      </select>

      <select
        value={errorType}
        onChange={(e) => onErrorTypeChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
      >
        <option value="">All error types</option>
        {errorTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <div className="relative flex-1">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search errors..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
    </div>
  )
}
```

**Step 3: Create ErrorList component**

```typescript
// src/components/admin/errors/ErrorList.tsx
'use client'

import { formatDistanceToNow } from 'date-fns'
import type { GroupedError } from '@/types/error-logging'

interface ErrorListProps {
  errors: GroupedError[]
  onSelectError: (fingerprint: string) => void
  isLoading?: boolean
}

export function ErrorList({ errors, onSelectError, isLoading }: ErrorListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (errors.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No errors found for the selected filters.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {errors.map((error) => (
        <button
          key={error.fingerprint}
          onClick={() => onSelectError(error.fingerprint)}
          className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  error.resolved_at
                    ? 'bg-gray-400'
                    : error.level === 'fatal'
                    ? 'bg-red-500'
                    : 'bg-orange-500'
                }`}
              />
              <span className="font-medium text-gray-900">{error.error_type}</span>
              <span className="text-sm text-gray-500">
                {error.count}×
              </span>
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {formatDistanceToNow(new Date(error.last_seen), { addSuffix: true })}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600 truncate">{error.message}</p>
          {error.route && (
            <p className="mt-1 text-xs text-gray-400">{error.route}</p>
          )}
        </button>
      ))}
    </div>
  )
}
```

**Step 4: Create ErrorDetailModal component**

```typescript
// src/components/admin/errors/ErrorDetailModal.tsx
'use client'

import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow, format } from 'date-fns'

interface ErrorOccurrence {
  id: string
  created_at: string
  url?: string
  method?: string
  user_email?: string
  vercel_region?: string
}

interface ErrorDetail {
  fingerprint: string
  error_type: string
  message: string
  level: string
  stack_trace?: string
  route?: string
  resolved_at?: string
  resolved_by?: string
  count: number
  first_seen: string
  last_seen: string
  occurrences: ErrorOccurrence[]
}

interface ErrorDetailModalProps {
  fingerprint: string | null
  onClose: () => void
  onResolve: (fingerprint: string, resolved: boolean) => Promise<void>
}

export function ErrorDetailModal({ fingerprint, onClose, onResolve }: ErrorDetailModalProps) {
  const [error, setError] = useState<ErrorDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResolving, setIsResolving] = useState(false)

  useEffect(() => {
    if (!fingerprint) {
      setError(null)
      return
    }

    setIsLoading(true)
    fetch(`/api/admin/errors/${fingerprint}`)
      .then((res) => res.json())
      .then((data) => {
        setError(data)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [fingerprint])

  const handleResolve = async () => {
    if (!error) return
    setIsResolving(true)
    await onResolve(error.fingerprint, !error.resolved_at)
    setError((prev) => prev ? { ...prev, resolved_at: prev.resolved_at ? undefined : new Date().toISOString() } : null)
    setIsResolving(false)
  }

  return (
    <Transition appear show={!!fingerprint} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl bg-white rounded-xl shadow-xl">
                <div className="flex items-center justify-between p-4 border-b">
                  <Dialog.Title className="text-lg font-semibold">
                    {error?.error_type || 'Loading...'}
                  </Dialog.Title>
                  <div className="flex items-center gap-2">
                    {error && (
                      <button
                        onClick={handleResolve}
                        disabled={isResolving}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          error.resolved_at
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {isResolving ? 'Updating...' : error.resolved_at ? 'Unresolve' : 'Mark Resolved'}
                      </button>
                    )}
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : error ? (
                  <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Message</h4>
                      <p className="mt-1 text-gray-900">{error.message}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Occurrences:</span>{' '}
                        <span className="font-medium">{error.count}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Route:</span>{' '}
                        <span className="font-mono">{error.route || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">First seen:</span>{' '}
                        {format(new Date(error.first_seen), 'MMM d, h:mm a')}
                      </div>
                      <div>
                        <span className="text-gray-500">Last seen:</span>{' '}
                        {format(new Date(error.last_seen), 'MMM d, h:mm a')}
                      </div>
                    </div>

                    {error.stack_trace && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Stack Trace</h4>
                        <pre className="p-3 bg-gray-900 text-gray-100 text-xs rounded-lg overflow-x-auto">
                          {error.stack_trace}
                        </pre>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Recent Occurrences</h4>
                      <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                        {error.occurrences.slice(0, 20).map((occ) => (
                          <div key={occ.id} className="px-3 py-2 text-sm flex justify-between">
                            <span className="text-gray-500">
                              {format(new Date(occ.created_at), 'h:mm:ss a')}
                            </span>
                            <span className="text-gray-700">{occ.user_email || 'anonymous'}</span>
                            <span className="text-gray-400">{occ.vercel_region || '-'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
```

**Step 5: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

**Step 6: Commit**

```bash
git add src/components/admin/errors/
git commit -m "feat(ui): add admin error monitoring components"
```

---

## Task 8: Create Admin Errors Page

**Files:**
- Create: `src/app/(admin)/errors/page.tsx`

**Step 1: Create the admin errors page**

```typescript
// src/app/(admin)/errors/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { ErrorStats } from '@/components/admin/errors/ErrorStats'
import { ErrorFilters } from '@/components/admin/errors/ErrorFilters'
import { ErrorList } from '@/components/admin/errors/ErrorList'
import { ErrorDetailModal } from '@/components/admin/errors/ErrorDetailModal'
import type { GroupedError, ErrorStats as ErrorStatsType } from '@/types/error-logging'

interface ErrorsResponse {
  errors: GroupedError[]
  stats: ErrorStatsType
  pagination: {
    limit: number
    offset: number
    total: number
  }
}

export default function AdminErrorsPage() {
  const [timeRange, setTimeRange] = useState('24h')
  const [errorType, setErrorType] = useState('')
  const [search, setSearch] = useState('')
  const [selectedFingerprint, setSelectedFingerprint] = useState<string | null>(null)

  const [data, setData] = useState<ErrorsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorTypes, setErrorTypes] = useState<string[]>([])

  const fetchErrors = useCallback(async () => {
    setIsLoading(true)
    const params = new URLSearchParams({
      timeRange,
      ...(errorType && { errorType }),
      ...(search && { search })
    })

    try {
      const res = await fetch(`/api/admin/errors?${params}`)
      const json = await res.json()
      setData(json)

      // Extract unique error types for filter dropdown
      const types = [...new Set(json.errors.map((e: GroupedError) => e.error_type))]
      setErrorTypes(types)
    } catch (err) {
      console.error('Failed to fetch errors:', err)
    } finally {
      setIsLoading(false)
    }
  }, [timeRange, errorType, search])

  useEffect(() => {
    fetchErrors()
  }, [fetchErrors])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchErrors()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, fetchErrors])

  const handleResolve = async (fingerprint: string, resolved: boolean) => {
    await fetch(`/api/admin/errors/${fingerprint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved })
    })
    fetchErrors()
  }

  const defaultStats: ErrorStatsType = {
    total_errors: 0,
    unique_types: 0,
    fatal_count: 0,
    resolved_count: 0,
    unresolved_count: 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Error Monitoring</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track and resolve application errors
        </p>
      </div>

      <ErrorStats stats={data?.stats || defaultStats} isLoading={isLoading} />

      <ErrorFilters
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        errorType={errorType}
        onErrorTypeChange={setErrorType}
        search={search}
        onSearchChange={setSearch}
        errorTypes={errorTypes}
      />

      <ErrorList
        errors={data?.errors || []}
        onSelectError={setSelectedFingerprint}
        isLoading={isLoading}
      />

      <ErrorDetailModal
        fingerprint={selectedFingerprint}
        onClose={() => setSelectedFingerprint(null)}
        onResolve={handleResolve}
      />
    </div>
  )
}
```

**Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

**Step 3: Run dev server and verify page loads**

Run: `bun run dev`
Navigate to: `http://localhost:3000/admin/errors`
Expected: Page loads with empty state (no errors yet)

**Step 4: Commit**

```bash
git add src/app/\(admin\)/errors/page.tsx
git commit -m "feat(admin): add error monitoring page"
```

---

## Task 9: Add Integration Tests for Error Logging

**Files:**
- Create: `tests/integration/error-logging.test.ts`

**Step 1: Write integration tests**

```typescript
// tests/integration/error-logging.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateFingerprint } from '@/lib/logger'

describe('Error Logging Integration', () => {
  describe('Fingerprint Generation', () => {
    it('generates consistent fingerprint for identical errors', () => {
      const error1 = {
        type: 'TypeError',
        message: 'Cannot read property x of undefined',
        stack: `Error: Cannot read property x
    at processData (src/lib/data.ts:45:12)
    at handler (src/app/api/route.ts:23:5)`
      }

      const fp1 = generateFingerprint(error1.type, error1.message, error1.stack)
      const fp2 = generateFingerprint(error1.type, error1.message, error1.stack)

      expect(fp1).toBe(fp2)
      expect(fp1.length).toBeGreaterThan(0)
    })

    it('generates different fingerprints for different errors', () => {
      const fp1 = generateFingerprint(
        'TypeError',
        'Cannot read x',
        'at foo (a.ts:1)'
      )
      const fp2 = generateFingerprint(
        'ReferenceError',
        'x is not defined',
        'at bar (b.ts:2)'
      )

      expect(fp1).not.toBe(fp2)
    })

    it('uses first stack frame for fingerprinting', () => {
      const stack1 = `Error: Test
    at commonFrame (shared.ts:10)
    at differentCaller1 (a.ts:5)`

      const stack2 = `Error: Test
    at commonFrame (shared.ts:10)
    at differentCaller2 (b.ts:8)`

      const fp1 = generateFingerprint('Error', 'Test', stack1)
      const fp2 = generateFingerprint('Error', 'Test', stack2)

      // Same first frame = same fingerprint
      expect(fp1).toBe(fp2)
    })
  })
})
```

**Step 2: Run tests**

Run: `bun test tests/integration/error-logging.test.ts`
Expected: PASS

**Step 3: Commit**

```bash
git add tests/integration/error-logging.test.ts
git commit -m "test(integration): add error logging tests"
```

---

## Task 10: Add Integration Tests for Admin Auth

**Files:**
- Extend: `tests/integration/admin-auth.test.ts`

**Step 1: Add more admin auth tests**

```typescript
// tests/integration/admin-auth.test.ts (extend existing file)

describe('Admin Email Whitelist', () => {
  beforeEach(() => {
    process.env.ADMIN_EMAILS = 'admin@example.com,super@example.com'
  })

  it('allows whitelisted email', async () => {
    vi.resetModules()
    const { isAdminEmail } = await import('@/lib/admin-auth')

    expect(isAdminEmail('admin@example.com')).toBe(true)
    expect(isAdminEmail('ADMIN@EXAMPLE.COM')).toBe(true) // Case insensitive
  })

  it('rejects non-whitelisted email', async () => {
    vi.resetModules()
    const { isAdminEmail } = await import('@/lib/admin-auth')

    expect(isAdminEmail('hacker@evil.com')).toBe(false)
    expect(isAdminEmail('')).toBe(false)
  })
})

describe('Admin Role Check', () => {
  it('accepts user with admin role in metadata', async () => {
    const { hasAdminRole } = await import('@/lib/admin-auth')

    const userWithRole = {
      user_metadata: { role: 'admin' }
    }

    expect(hasAdminRole(userWithRole as any)).toBe(true)
  })

  it('rejects user without admin role', async () => {
    const { hasAdminRole } = await import('@/lib/admin-auth')

    const regularUser = {
      user_metadata: { role: 'user' }
    }

    expect(hasAdminRole(regularUser as any)).toBe(false)
  })
})
```

**Step 2: Run tests**

Run: `bun test tests/integration/admin-auth.test.ts`
Expected: PASS (may need to export isAdminEmail and hasAdminRole from admin-auth.ts)

**Step 3: Commit**

```bash
git add tests/integration/admin-auth.test.ts
git commit -m "test(integration): add comprehensive admin auth tests"
```

---

## Task 11: Create Grafana Dashboard JSON

**Files:**
- Create: `grafana/dashboards/application-errors.json`

**Step 1: Create dashboard JSON**

```json
{
  "dashboard": {
    "id": null,
    "uid": "app-errors",
    "title": "Application Errors - Hudson Digital",
    "tags": ["application", "errors", "next.js"],
    "timezone": "browser",
    "schemaVersion": 39,
    "version": 1,
    "refresh": "1m",
    "time": {
      "from": "now-24h",
      "to": "now"
    },
    "panels": [
      {
        "id": 1,
        "title": "Error Rate Over Time",
        "type": "timeseries",
        "gridPos": { "h": 8, "w": 24, "x": 0, "y": 0 },
        "datasource": { "type": "grafana-postgresql-datasource", "uid": "supabase" },
        "targets": [
          {
            "rawSql": "SELECT date_trunc('hour', created_at) as time, COUNT(*) as errors FROM error_logs WHERE created_at >= $__timeFrom() AND created_at <= $__timeTo() GROUP BY 1 ORDER BY 1",
            "format": "time_series"
          }
        ]
      },
      {
        "id": 2,
        "title": "Errors by Type",
        "type": "barchart",
        "gridPos": { "h": 8, "w": 12, "x": 0, "y": 8 },
        "datasource": { "type": "grafana-postgresql-datasource", "uid": "supabase" },
        "targets": [
          {
            "rawSql": "SELECT error_type, COUNT(*) as count FROM error_logs WHERE created_at >= $__timeFrom() AND created_at <= $__timeTo() GROUP BY error_type ORDER BY count DESC LIMIT 10",
            "format": "table"
          }
        ]
      },
      {
        "id": 3,
        "title": "Errors by Route",
        "type": "barchart",
        "gridPos": { "h": 8, "w": 12, "x": 12, "y": 8 },
        "datasource": { "type": "grafana-postgresql-datasource", "uid": "supabase" },
        "targets": [
          {
            "rawSql": "SELECT route, COUNT(*) as count FROM error_logs WHERE created_at >= $__timeFrom() AND created_at <= $__timeTo() AND route IS NOT NULL GROUP BY route ORDER BY count DESC LIMIT 10",
            "format": "table"
          }
        ]
      },
      {
        "id": 4,
        "title": "Recent Errors",
        "type": "table",
        "gridPos": { "h": 10, "w": 24, "x": 0, "y": 16 },
        "datasource": { "type": "grafana-postgresql-datasource", "uid": "supabase" },
        "targets": [
          {
            "rawSql": "SELECT created_at as \"Time\", level as \"Level\", error_type as \"Type\", message as \"Message\", route as \"Route\" FROM error_logs WHERE created_at >= $__timeFrom() AND created_at <= $__timeTo() ORDER BY created_at DESC LIMIT 50",
            "format": "table"
          }
        ]
      }
    ]
  }
}
```

**Step 2: Commit**

```bash
mkdir -p grafana/dashboards
git add grafana/dashboards/application-errors.json
git commit -m "feat(grafana): add application errors dashboard"
```

---

## Task 12: Create Alertmanager Configuration

**Files:**
- Create: `docs/monitoring/alertmanager-config.yaml`

**Step 1: Create alertmanager config documentation**

```yaml
# docs/monitoring/alertmanager-config.yaml
# Add this to your Alertmanager configuration in K3s

# Route configuration for error alerts
route:
  receiver: 'error-email-digest'
  group_by: ['alertname', 'fingerprint']
  group_wait: 5m        # Wait 5 min to batch similar alerts
  group_interval: 1h    # Don't re-alert same group within 1 hour
  repeat_interval: 4h   # Repeat if still firing after 4 hours
  routes:
    - match:
        severity: fatal
      receiver: 'fatal-immediate'
      group_wait: 1m
      group_interval: 15m

receivers:
  - name: 'error-email-digest'
    email_configs:
      - to: 'YOUR_EMAIL@example.com'  # Replace with your email
        from: 'alerts@thehudsonfam.com'
        smarthost: 'smtp.example.com:587'
        auth_username: 'alerts@thehudsonfam.com'
        auth_password: '{{ .ExternalSecret "smtp_password" }}'
        send_resolved: true
        headers:
          Subject: '[Hudson Digital] {{ .GroupLabels.alertname }}: {{ .Alerts.Firing | len }} errors'
        html: |
          <h2>Error Summary</h2>
          {{ range .Alerts }}
          <div style="margin: 10px 0; padding: 10px; background: #f5f5f5;">
            <strong>{{ .Labels.error_type }}</strong> ({{ .Labels.count }}×)<br>
            {{ .Annotations.message }}<br>
            <small>Route: {{ .Labels.route }}</small>
          </div>
          {{ end }}
          <p><a href="https://your-site.com/admin/errors">View in Admin Panel</a></p>

  - name: 'fatal-immediate'
    email_configs:
      - to: 'YOUR_EMAIL@example.com'
        send_resolved: true
        headers:
          Subject: '[FATAL] {{ .GroupLabels.error_type }}'
```

**Step 2: Commit**

```bash
mkdir -p docs/monitoring
git add docs/monitoring/alertmanager-config.yaml
git commit -m "docs(monitoring): add alertmanager configuration for error alerts"
```

---

## Task 13: Final Integration and Testing

**Step 1: Run all tests**

Run: `bun test`
Expected: All tests pass

**Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: No errors

**Step 3: Run lint**

Run: `bun run lint`
Expected: No errors

**Step 4: Build**

Run: `bun run build`
Expected: Build succeeds

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete error monitoring system implementation"
```

---

## Summary

This implementation plan covers:

1. **P0 Security Fix**: ADMIN_EMAILS validation with tests
2. **Database**: error_logs table with fingerprinting and RLS
3. **Enhanced Logger**: Supabase push with context and fingerprinting
4. **Admin API**: List, detail, and resolve endpoints
5. **Admin UI**: Stats, filters, list, and detail modal
6. **Grafana**: Dashboard JSON for visualization
7. **Alertmanager**: Configuration for grouped email digests
8. **Integration Tests**: Admin auth and error logging coverage

Total: 13 tasks, ~15-20 commits, estimated 3-4 hours implementation time.
