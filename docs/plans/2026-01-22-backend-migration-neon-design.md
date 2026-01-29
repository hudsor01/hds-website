# Backend Migration: Supabase to Neon + Bun.SQL + Drizzle ORM

**Date:** 2026-01-22
**Status:** Design Review
**Scope:** Complete backend rewrite

## Executive Summary

Migrate from Supabase (SDK + Auth + PostgreSQL) to a unified Neon stack:
- **Database:** Neon PostgreSQL (serverless, branching)
- **Database Client:** Bun.SQL (built-in, zero dependencies)
- **ORM:** Drizzle ORM (type-safe, SQL-first)
- **Authentication:** Neon Auth (built on Better Auth)

## Why This Migration?

| Concern | Current (Supabase) | New (Neon Stack) |
|---------|-------------------|------------------|
| **Dependencies** | `@supabase/supabase-js`, `@supabase/ssr` | Zero npm deps for DB (Bun.SQL built-in) |
| **Performance** | REST API overhead | Direct PostgreSQL wire protocol (50% faster) |
| **Auth Integration** | Separate auth system | Auth data lives in your database |
| **Branching** | Data-less branches (need seeds) | Full copy-on-write branches with data |
| **Type Safety** | Generated types, SDK abstraction | Drizzle schema = single source of truth |
| **Vendor Lock-in** | Supabase-specific APIs | Standard PostgreSQL + portable auth |

## New Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js 15 App                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────────────────────┐   │
│  │    Neon Auth     │    │         Data Access Layer         │   │
│  │   ────────────   │    │         ──────────────────        │   │
│  │   • signIn()     │    │   Drizzle ORM + Bun.SQL           │   │
│  │   • signOut()    │    │                                    │   │
│  │   • getUser()    │    │   db.select().from(users)          │   │
│  │   • OAuth flows  │    │   db.insert(leads).values({...})   │   │
│  │   • MFA          │    │   db.update(cases).set({...})      │   │
│  │   • Sessions     │    │   db.delete(logs).where(...)       │   │
│  └────────┬─────────┘    └────────────────┬─────────────────┘   │
│           │                                │                     │
│           └────────────┬───────────────────┘                     │
│                        │                                         │
│                        ▼                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                      Bun.SQL                             │    │
│  │   ─────────────────────────────────────────────────────  │    │
│  │   • Zero npm dependencies (built into Bun)               │    │
│  │   • Connection pooling (max: 20)                         │    │
│  │   • Prepared statements (automatic)                      │    │
│  │   • Transactions (sql.begin())                           │    │
│  │   • TLS/SSL verification                                 │    │
│  └───────────────────────────┬─────────────────────────────┘    │
│                               │                                  │
└───────────────────────────────┼──────────────────────────────────┘
                                │
                                ▼
                 ┌──────────────────────────┐
                 │    Neon PostgreSQL       │
                 │    (Serverless)          │
                 │   ────────────────────   │
                 │   • Autoscaling          │
                 │   • Branch per PR        │
                 │   • Scale to zero        │
                 │   • neon_auth schema     │
                 └──────────────────────────┘
```

## Technology Stack Details

### 1. Bun.SQL (Database Client)

Built into Bun runtime - no npm install needed.

```typescript
// src/lib/db.ts
import { SQL } from 'bun';

export const sql = new SQL({
  url: process.env.POSTGRES_URL,
  max: 20,                    // Connection pool size
  idleTimeout: 30,            // Close idle connections after 30s
  connectionTimeout: 10,      // 10s to establish connection
  tls: true,                  // Required for Neon
});

// Tagged template literals (safe from SQL injection)
const users = await sql`SELECT * FROM users WHERE id = ${userId}`;

// Transactions
await sql.begin(async (tx) => {
  await tx`INSERT INTO audit_log (action) VALUES ('user_created')`;
  await tx`UPDATE users SET status = 'active' WHERE id = ${userId}`;
});
```

**Key Features:**
- Tagged template literals for safe SQL
- Automatic connection pooling
- Automatic prepared statements
- Transaction support with savepoints
- 50% faster than npm postgres clients

### 2. Drizzle ORM

SQL-first ORM with full type safety.

```typescript
// src/lib/schema/leads.ts
import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';

export const calculatorLeads = pgTable('calculator_leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  name: text('name'),
  calculatorType: text('calculator_type').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  contacted: boolean('contacted').default(false),
});

// Type is automatically inferred
export type CalculatorLead = typeof calculatorLeads.$inferSelect;
export type NewCalculatorLead = typeof calculatorLeads.$inferInsert;
```

```typescript
// src/lib/db.ts
import { drizzle } from 'drizzle-orm/bun-sql';
import { SQL } from 'bun';
import * as schema from './schema';

const client = new SQL(process.env.POSTGRES_URL);
export const db = drizzle({ client, schema });

// Usage in data layer
import { db } from '@/lib/db';
import { calculatorLeads } from '@/lib/schema/leads';
import { eq, desc } from 'drizzle-orm';

// SELECT
const leads = await db
  .select()
  .from(calculatorLeads)
  .where(eq(calculatorLeads.contacted, false))
  .orderBy(desc(calculatorLeads.createdAt));

// INSERT
const [newLead] = await db
  .insert(calculatorLeads)
  .values({ email: 'user@example.com', calculatorType: 'paystub' })
  .returning();

// UPDATE
await db
  .update(calculatorLeads)
  .set({ contacted: true })
  .where(eq(calculatorLeads.id, leadId));
```

### 3. Neon Auth (Authentication)

Built on Better Auth, stores auth data in your database.

```typescript
// src/lib/auth.ts
import { createAuthClient } from '@neondatabase/neon-js/auth';

export const authClient = createAuthClient(
  process.env.NEXT_PUBLIC_NEON_AUTH_URL!
);

// Server-side session check
import { stackServerApp } from '@/stack';

export async function requireAuth() {
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect('/handler/login');
  }
  return user;
}
```

**Neon Auth Features:**
- Email/password authentication
- OAuth (Google, GitHub, Microsoft)
- Multi-factor authentication (MFA)
- Session management in database
- Branch-aware (auth state branches with database)
- RLS integration (policies can reference `auth.user_id()`)

## Migration Plan

### Phase 1: Database Migration (No Downtime)

1. **Create Neon Project**
   - Match PostgreSQL version with Supabase
   - Configure connection pooling

2. **Export Supabase Data**
   ```bash
   pg_dump -Fc -v -d "SUPABASE_CONNECTION_STRING" \
     --schema=public \
     --no-owner --no-acl \
     -f supabase_dump.bak
   ```

3. **Import to Neon**
   ```bash
   pg_restore -d "NEON_CONNECTION_STRING" -v \
     --no-owner --no-acl \
     supabase_dump.bak
   ```

4. **Verify Data Integrity**
   ```sql
   SELECT COUNT(*) FROM calculator_leads;
   SELECT COUNT(*) FROM case_studies;
   -- Compare with Supabase counts
   ```

### Phase 2: Auth Migration

1. **Export Supabase Users**
   ```sql
   -- Run in Supabase SQL Editor
   CREATE OR REPLACE FUNCTION export_users()
   RETURNS TABLE (email text, encrypted_password varchar(255)) AS $$
   BEGIN
     RETURN QUERY
     SELECT DISTINCT ON (i.email) i.email, u.encrypted_password
     FROM auth.users u
     JOIN auth.identities i ON u.id = i.user_id;
   END;
   $$ LANGUAGE plpgsql;

   SELECT * FROM export_users();
   -- Export as CSV
   ```

2. **Enable Neon Auth**
   - Navigate to Neon Console > Data API
   - Enable Neon Auth
   - Copy Project ID and Server Key

3. **Import Users to Neon Auth**
   - Run migration script (preserves password hashes)
   - Users can log in with existing passwords

4. **Remap User IDs**
   ```sql
   -- Update foreign keys to new Neon Auth user IDs
   UPDATE calculator_leads AS l
   SET user_id = ns.id::text
   FROM temp_user_mapping AS tm
   JOIN neon_auth.users_sync AS ns ON tm.email = ns.email
   WHERE l.user_id = tm.old_id::text;
   ```

### Phase 3: Update RLS Policies

```sql
-- Replace Supabase auth functions with Neon equivalents
-- Before: auth.uid()
-- After:  auth.user_id()

-- Example policy update
DROP POLICY IF EXISTS "Users can view own data" ON calculator_leads;
CREATE POLICY "Users can view own data" ON calculator_leads
  FOR SELECT USING (auth.user_id() = user_id);

-- Update role names
-- Before: anon
-- After:  anonymous
GRANT SELECT ON calculator_leads TO anonymous;
GRANT ALL ON calculator_leads TO authenticated;
```

### Phase 4: Code Migration

#### 4.1 Create Drizzle Schema

Convert `src/types/database.ts` (Supabase generated types) to Drizzle schema:

```typescript
// src/lib/schema/index.ts
export * from './leads';
export * from './case-studies';
export * from './testimonials';
export * from './analytics';
// ... etc
```

#### 4.2 Update Data Access Layer

| File | Changes |
|------|---------|
| `src/lib/case-studies.ts` | Replace Supabase queries with Drizzle |
| `src/lib/testimonials.ts` | Replace Supabase queries with Drizzle |
| `src/lib/help-articles.ts` | Replace Supabase queries with Drizzle |
| `src/lib/projects.ts` | Replace Supabase queries with Drizzle |
| `src/lib/scheduled-emails.ts` | Replace Supabase queries with Drizzle |
| `src/app/api/**/route.ts` | Update all API routes |
| `src/app/actions/*.ts` | Update all Server Actions |

**Before (Supabase):**
```typescript
const { data, error } = await supabase
  .from('case_studies')
  .select('*')
  .eq('published', true)
  .order('created_at', { ascending: false });
```

**After (Drizzle):**
```typescript
const data = await db
  .select()
  .from(caseStudies)
  .where(eq(caseStudies.published, true))
  .orderBy(desc(caseStudies.createdAt));
```

#### 4.3 Update Authentication

**Before (Supabase SSR):**
```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
```

**After (Neon Auth):**
```typescript
import { stackServerApp } from '@/stack';

const user = await stackServerApp.getUser();
```

#### 4.4 Delete Deprecated Files

```
src/lib/supabase.ts              # Delete
src/lib/supabase/client.ts       # Delete
src/lib/supabase/server.ts       # Delete
src/lib/supabase/middleware.ts   # Delete
src/types/database.ts            # Replace with Drizzle schema
```

### Phase 5: Environment Variables

**Remove:**
```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
```

**Add:**
```bash
# Neon Database
POSTGRES_URL="postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Neon Auth
NEXT_PUBLIC_NEON_AUTH_URL="https://auth.neon.tech/v1/projects/xxx"
NEON_AUTH_PROJECT_ID="xxx"
NEON_AUTH_SERVER_KEY="xxx"

# OAuth (if using)
AUTH_GITHUB_ID="xxx"
AUTH_GITHUB_SECRET="xxx"
AUTH_GOOGLE_ID="xxx"
AUTH_GOOGLE_SECRET="xxx"
```

## File Changes Summary

### New Files
```
src/lib/db.ts                    # Bun.SQL + Drizzle client
src/lib/schema/index.ts          # Schema barrel export
src/lib/schema/leads.ts          # Leads table schema
src/lib/schema/case-studies.ts   # Case studies schema
src/lib/schema/testimonials.ts   # Testimonials schema
src/lib/schema/analytics.ts      # Analytics tables schema
src/lib/schema/auth.ts           # Auth-related tables
src/lib/auth.ts                  # Neon Auth client
src/stack.ts                     # Stack server config
drizzle.config.ts                # Drizzle Kit config
```

### Modified Files (~25 files)
- All files in `src/lib/` that query database
- All API routes in `src/app/api/`
- All Server Actions in `src/app/actions/`
- `src/lib/admin-auth.ts` (switch to Neon Auth)
- `src/components/admin/AuthWrapper.tsx` (switch to Neon Auth)
- `middleware.ts` (switch to Neon Auth)
- `src/app/layout.tsx` (add auth providers)

### Deleted Files
```
src/lib/supabase.ts
src/lib/supabase/client.ts
src/lib/supabase/server.ts
src/lib/supabase/middleware.ts
src/types/database.ts
supabase/config.toml             # No longer needed
```

## Dependencies

### Remove
```json
{
  "@supabase/supabase-js": "remove",
  "@supabase/ssr": "remove"
}
```

### Add
```json
{
  "drizzle-orm": "^0.38.x",
  "@neondatabase/neon-js": "^1.x",
  "@stackframe/stack": "^2.x"
}
```

### Dev Dependencies
```json
{
  "drizzle-kit": "^0.30.x"
}
```

## Neon Pricing (vs Supabase)

| Tier | Neon | Supabase |
|------|------|----------|
| Free | 0.5 GB storage, 190 compute hours | 500 MB, 2 projects |
| Launch ($19/mo) | 10 GB, 300 compute hours | 8 GB, 50K MAU |
| Scale ($69/mo) | 50 GB, 750 compute hours | 100 GB, 100K MAU |

**Neon Auth Pricing:** Included, up to 60K MAU free.

## Benefits of Migration

1. **Zero Database Dependencies**
   - Bun.SQL is built into the runtime
   - No `npm install` for database client

2. **50% Faster Queries**
   - Direct PostgreSQL wire protocol
   - No REST API overhead

3. **Branch-Aware Development**
   - Full database + auth copies per PR
   - No seed scripts needed

4. **Single Source of Truth**
   - Drizzle schema defines types
   - No generated types to sync

5. **Portable Authentication**
   - Better Auth is open source
   - Can self-host if needed

6. **Unified Stack**
   - Database, auth, branching from one provider
   - Simpler mental model

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Data loss during migration | Full backup before migration, verify counts |
| Auth migration breaks logins | Preserve password hashes, test thoroughly |
| RLS policy differences | Audit all policies, test each role |
| Drizzle learning curve | SQL-first means minimal new syntax |
| Neon Auth is Beta | Better Auth is stable; Neon adds management |

## Success Criteria

- [ ] All data migrated with verified counts
- [ ] All users can log in with existing credentials
- [ ] All RLS policies work correctly
- [ ] All API routes return same data
- [ ] All E2E tests pass
- [ ] Build succeeds with no TypeScript errors
- [ ] No Supabase dependencies in package.json

## Timeline Estimate

| Phase | Duration |
|-------|----------|
| Phase 1: Database Migration | 1-2 hours |
| Phase 2: Auth Migration | 2-3 hours |
| Phase 3: RLS Policies | 1-2 hours |
| Phase 4: Code Migration | 1-2 days |
| Phase 5: Testing | 1 day |
| **Total** | **2-3 days** |

## References

- [Bun.SQL Documentation](https://bun.com/docs/runtime/sql)
- [Drizzle ORM - Bun SQL](https://orm.drizzle.team/docs/connect-bun-sql)
- [Neon Auth Overview](https://neon.com/docs/auth/overview)
- [Neon + Bun Guide](https://neon.com/docs/guides/bun)
- [Complete Supabase to Neon Migration](https://neon.com/guides/complete-supabase-migration)
- [Migrate from Supabase to Neon](https://neon.com/docs/import/migrate-from-supabase)
