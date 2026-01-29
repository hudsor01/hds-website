# Phase 22: Auth Migration Research

## Overview

This document contains research findings for migrating from Supabase Auth to Neon Auth. The migration is complex due to architectural differences between the two systems.

---

## 1. Neon Auth Overview

### What is Neon Auth?

Neon Auth is a managed authentication service built on **Better Auth** (v1.4.6) that integrates directly with Neon Postgres databases. Unlike Supabase's separate auth service, Neon Auth stores all user data, sessions, and configuration directly in your database's `neon_auth` schema.

### Key Features

| Feature | Description |
|---------|-------------|
| **Database-centric storage** | All identity data lives in Postgres, queryable via SQL |
| **Branch-aware authentication** | Each database branch has isolated auth environments |
| **Zero infrastructure** | Neon manages deployment and regional co-location |
| **Data API integration** | Native JWT validation for Neon's Data API |
| **RLS compatible** | Works with Row Level Security policies |

### Supported Authentication Methods

- Email/password authentication
- OAuth flows (Google, GitHub, Microsoft out-of-the-box)
- Session management

### NOT Supported (compared to Supabase)

- Phone authentication (SMS/WhatsApp)
- SAML SSO
- Web3 wallet sign-in
- Magic link emails (requires custom implementation)

### Availability Constraints

- **AWS regions only** - Azure not yet supported
- **Incompatible with:** IP Allow lists and Private Networking features

### Pricing (MAU = Monthly Active Users)

| Plan | MAU Limit |
|------|-----------|
| Free | 60,000 |
| Launch | 1,000,000 |
| Scale | 1,000,000 |

---

## 2. User Export from Supabase

### SQL Function for Extracting Users

Execute this in Supabase SQL Editor to export users with their password hashes:

```sql
CREATE OR REPLACE FUNCTION ufn_get_user_emails_and_passwords()
RETURNS table (email text, encrypted_password character varying(255)) AS
$$
BEGIN
RETURN QUERY
   SELECT DISTINCT ON (i.email)
       i.email,
       u.encrypted_password
   FROM auth.users u
   JOIN auth.identities i ON u.id = i.user_id;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT * FROM ufn_get_user_emails_and_passwords();
```

### Export Process

1. Run the function in Supabase SQL Editor
2. Export results as `user_data.csv`
3. The CSV contains: `email`, `encrypted_password`
4. OAuth-only users will have `NULL` for `encrypted_password`

---

## 3. Password Hash Preservation (bcrypt)

### CRITICAL FINDING: Conflicting Documentation

The documentation provides **two conflicting statements**:

1. **From the migration guide:** "Existing password-based users cannot migrate due to different hashing algorithms."
2. **From the complete guide:** The user import script accepts bcrypt hashes and imports them directly.

### Analysis

The complete Supabase migration guide shows bcrypt password hashes being imported via the Neon Auth API, suggesting password preservation IS possible. The import script passes `password_hash` directly to the API.

### User Import Script Configuration

```typescript
const CONFIG = {
  csvFilePath: './user_data.csv',
  apiUrl: 'https://api.stack-auth.com/api/v1/users',
  headers: {
    'X-Stack-Project-Id': 'YOUR_PROJECT_ID',
    'X-Stack-Secret-Server-Key': 'YOUR_SERVER_KEY',
  },
  requestDelay: 500, // Rate limiting between API calls
};
```

### Import Script Behavior

- Handles `NULL` passwords (OAuth-only users)
- Implements rate limiting (500ms delay between requests)
- Creates users via Stack Auth API (Neon Auth's underlying service)

### Recommendation

- Test password migration with a small batch first
- Have password reset flow ready as fallback
- OAuth users migrate seamlessly without issues

---

## 4. User ID Remapping Process

### The Challenge

**Neon Auth assigns NEW unique `user_id` values to all imported users.** This means all foreign key relationships in your database pointing to the old Supabase `auth.users.id` must be updated.

### Step-by-Step Remapping Process

#### Step 1: Export Original User Data

```bash
pg_dump -t auth.users --data-only --column-inserts "SUPABASE_CONNECTION_STRING" \
| sed 's/INSERT INTO auth.users/INSERT INTO public.temp_users/g' \
| psql "NEON_CONNECTION_STRING"
```

This creates a `temp_users` table with old user IDs mapped to emails.

#### Step 2: Create Mapping Query

```sql
-- Example: Update a table with user_id foreign key
UPDATE your_table t
SET user_id = na.id
FROM temp_users tu
JOIN neon_auth.user na ON tu.email = na.email
WHERE t.user_id = tu.id::text;
```

#### Step 3: Update Column Types

Supabase uses `UUID` for user IDs, Neon Auth uses `TEXT`. Update your schema:

```sql
ALTER TABLE your_table
ALTER COLUMN user_id TYPE TEXT;
```

#### Step 4: Recreate Foreign Keys

After remapping, recreate foreign key constraints pointing to `neon_auth.user`:

```sql
ALTER TABLE your_table
ADD CONSTRAINT fk_user_id
FOREIGN KEY (user_id) REFERENCES neon_auth.user(id);
```

### Tables Requiring Remapping

In this project, audit these tables for `user_id` columns:
- Any table with RLS policies using `auth.uid()`
- Contact submissions (if tied to users)
- Lead magnet downloads (if tracking users)
- Any future user-specific data

---

## 5. Neon Auth SDK Initialization

### Package Installation

```bash
# Remove Supabase auth packages
npm uninstall @supabase/ssr @supabase/supabase-js

# Install Neon packages
npm install @neondatabase/neon-js
npm install @supabase/postgrest-js@1.19.4  # For data queries
```

### SDK Initialization (Basic)

```typescript
import { createAuthClient } from '@neondatabase/neon-js/auth';

export const authClient = createAuthClient(
  process.env.NEXT_PUBLIC_NEON_AUTH_URL!
);
```

### Automatic Setup (Next.js)

```bash
npx @stackframe/init-stack@latest --no-browser
```

This scaffolds:
- Auth client configuration
- Middleware for session handling
- Provider components

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_NEON_AUTH_URL` | Public auth endpoint |
| `NEON_PROJECT_ID` | Project identifier |
| `NEON_SECRET_SERVER_KEY` | Server-side operations |
| `DATABASE_URL` | Neon database connection |

---

## 6. Key Differences from Supabase

### API Function Changes

| Supabase | Neon Auth |
|----------|-----------|
| `auth.uid()` | `auth.user_id()` |
| `supabase.auth.getUser()` | `authClient.getUser()` |
| `supabase.auth.getSession()` | `useUser()` hook |
| `onAuthStateChange()` | `useUser()` hook (reactive) |

### Database Role Changes

| Supabase | Neon |
|----------|------|
| `anon` | `anonymous` |
| `authenticated` | `authenticated` |

### User ID Type Change

| Supabase | Neon |
|----------|------|
| `UUID` | `TEXT` |

### RLS Policy Updates Required

```sql
-- Update RLS policies from:
USING (auth.uid() = user_id)

-- To:
USING (auth.user_id() = user_id)

-- Update role grants:
GRANT SELECT, UPDATE, INSERT, DELETE
ON ALL TABLES IN SCHEMA public
TO anonymous, authenticated;
```

---

## 7. Migration Strategy Recommendation

### Phase 1: Preparation (Before Migration)

1. Audit all tables with `user_id` foreign keys
2. Document all RLS policies using `auth.uid()`
3. Export complete user list from Supabase
4. Test password import with small batch

### Phase 2: Database Migration

1. Export schema with `pg_dump` (exclude `auth` schema)
2. Modify schema:
   - Replace `auth.uid()` with `auth.user_id()`
   - Change `user_id` columns from UUID to TEXT
   - Remove FK constraints to `auth.users` temporarily
3. Import schema to Neon

### Phase 3: Auth Migration

1. Import users via Neon Auth API
2. Create temp mapping table
3. Update all `user_id` values using email mapping
4. Recreate FK constraints to `neon_auth.user`

### Phase 4: Code Migration

1. Replace Supabase SDK with Neon SDK
2. Update auth hooks and components
3. Update API routes
4. Update middleware

### Phase 5: Verification

1. Test new user registration
2. Test existing user login (password)
3. Test OAuth flows
4. Verify RLS policies work
5. Query `neon_auth.user` to confirm data

---

## 8. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Password hash incompatibility | High - Users can't login | Have password reset flow ready |
| User ID remapping errors | High - Data integrity | Test thoroughly on branch first |
| Missing FK relationships | Medium - Data orphaned | Audit all tables before migration |
| OAuth provider config | Medium - OAuth broken | Re-register OAuth apps with Neon |
| RLS policy failures | High - Security/access issues | Test each policy individually |

---

## 9. Current Project Assessment

### Auth Usage in This Project

Based on codebase analysis needed:
- [ ] Server-side auth checks
- [ ] Client-side auth state
- [ ] Protected routes
- [ ] RLS policies on tables
- [ ] User-specific data storage

### Migration Complexity Assessment

**Factors:**
1. Number of tables with user references
2. Complexity of RLS policies
3. Number of auth-dependent components
4. OAuth providers in use

---

## 10. Sources

1. Neon Auth Overview: https://neon.com/docs/auth/overview
2. Migration from Supabase: https://neon.com/docs/auth/migrate/from-supabase
3. Complete Supabase Migration Guide: https://neon.com/guides/complete-supabase-migration

---

## Next Steps

1. [ ] Audit current Supabase auth usage in codebase
2. [ ] Identify all tables with user_id columns
3. [ ] Document current RLS policies
4. [ ] Create migration test plan
5. [ ] Set up Neon branch for migration testing
