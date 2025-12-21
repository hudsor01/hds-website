# Error Monitoring System Design

**Date:** December 20, 2025
**Status:** Approved
**Author:** Claude + Richard

## Overview

Implement server-side error monitoring for the Hudson Digital Solutions website hosted on Vercel, with visibility through both an admin panel and Grafana dashboards, plus grouped email alerts via Alertmanager.

## Goals

1. Capture all server-side errors (API routes, Server Actions)
2. Store errors in Supabase with intelligent grouping (fingerprinting)
3. Provide an admin panel at `/admin/errors` for viewing and managing errors
4. Create Grafana dashboard for error trends visualization
5. Configure Alertmanager for grouped/throttled email digests
6. Add integration tests for admin auth (P0 fix) and error logging

## Architecture

```
Vercel (Next.js)
    │
    ▼ HTTP POST (on error)
Supabase (error_logs table)
    │
    ├──► Admin Panel (/admin/errors)
    │
    └──► Grafana Dashboard
              │
              ▼
         Alertmanager → Email Digests
```

## Components

### 1. Database Schema

**Table: `error_logs`**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| created_at | TIMESTAMPTZ | Error timestamp |
| level | TEXT | 'error' or 'fatal' |
| error_type | TEXT | Error class name |
| fingerprint | TEXT | Hash for grouping identical errors |
| message | TEXT | Error message |
| stack_trace | TEXT | Full stack trace |
| url | TEXT | Request URL |
| method | TEXT | HTTP method |
| route | TEXT | Next.js route |
| request_id | TEXT | Unique request ID |
| user_id | UUID | Authenticated user (optional) |
| user_email | TEXT | User email (optional) |
| environment | TEXT | 'production' |
| vercel_region | TEXT | Edge region |
| metadata | JSONB | Additional context |

**Indexes:**
- `created_at DESC` - Time-based queries
- `fingerprint` - Grouping queries
- `error_type` - Filtering
- `level` - Fatal error queries

### 2. Enhanced Logger

**File:** `src/lib/logger.ts`

Enhancements:
- Add `pushToSupabase()` for async error storage
- Add `generateFingerprint()` for error grouping
- Add context parameter to `logger.error()`
- Add `logger.fatal()` for critical errors
- Non-blocking, fail-safe (falls back to console)

### 3. Admin Errors Page

**Route:** `/admin/errors`

Features:
- Metric cards (total errors, unique types, fatal count)
- Time range selector (1h, 24h, 7d, 30d)
- Filters (error type, route, search)
- Error list grouped by fingerprint with occurrence count
- Detail modal with stack trace and occurrence timeline
- Mark as resolved functionality

### 4. Admin Errors API

**Endpoints:**

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/errors` | List errors (grouped, filtered) |
| GET | `/api/admin/errors/[fingerprint]` | Error details + occurrences |
| PATCH | `/api/admin/errors/[fingerprint]` | Mark resolved |
| GET | `/api/admin/errors/stats` | Aggregate statistics |

### 5. Grafana Dashboard

**Panels:**
- Error rate over time (line chart)
- Errors by type (bar chart)
- Errors by route (bar chart)
- Recent errors table (live tail)

**Queries:** PostgreSQL queries against Supabase `error_logs` table

### 6. Alertmanager Configuration

**Rules:**
- Error Spike: >10 errors in 5 minutes
- Fatal Error: Any fatal-level error
- New Error Type: First occurrence of fingerprint

**Grouping:**
- Group by fingerprint
- Wait 5 minutes to collect similar errors
- Max 1 email per error group per hour
- Repeat after 4 hours if still firing

### 7. Integration Tests

**Files:**
- `tests/integration/error-logging.test.ts`
- `tests/integration/admin-auth.test.ts`
- `tests/integration/admin-errors-api.test.ts`

**Coverage:**
- Logger pushes to Supabase correctly
- Fingerprinting generates consistent hashes
- Admin auth validates email whitelist
- Admin auth checks role metadata
- Admin auth rejects unauthorized users
- ADMIN_EMAILS env validation (P0 fix)
- Errors API requires admin auth
- Errors API filtering and grouping

## Files to Create/Modify

### New Files
- `supabase/migrations/XXXXXX_create_error_logs.sql`
- `src/app/(admin)/errors/page.tsx`
- `src/components/admin/errors/ErrorList.tsx`
- `src/components/admin/errors/ErrorDetailModal.tsx`
- `src/components/admin/errors/ErrorFilters.tsx`
- `src/app/api/admin/errors/route.ts`
- `src/app/api/admin/errors/[fingerprint]/route.ts`
- `src/app/api/admin/errors/stats/route.ts`
- `tests/integration/error-logging.test.ts`
- `tests/integration/admin-auth.test.ts`
- `tests/integration/admin-errors-api.test.ts`
- `grafana/dashboards/application-errors.json`

### Modified Files
- `src/lib/logger.ts` - Add Supabase push, fingerprinting, context
- `src/lib/services/admin-service.ts` - Add ADMIN_EMAILS validation (P0)
- `src/app/(admin)/layout.tsx` - Add errors link to nav (if nav exists)

## Security Considerations

- Error logs only accessible to admins (RLS policy)
- Service role key used for inserting (not exposed to client)
- No sensitive data in error metadata (passwords, tokens)
- Rate limiting on admin API endpoints

## Rollout Plan

1. Deploy database migration
2. Deploy enhanced logger (starts collecting)
3. Deploy admin errors page
4. Configure Grafana dashboard
5. Configure Alertmanager rules
6. Add integration tests
7. Monitor for 24-48 hours before enabling email alerts

## Success Metrics

- Errors captured within 1 second of occurrence
- Admin panel loads errors in <500ms
- Email digests sent within 5 minutes of threshold
- Zero false-positive alerts in first week
- 100% admin auth test coverage (P0 resolved)
