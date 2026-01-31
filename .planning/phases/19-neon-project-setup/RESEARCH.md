# Phase 19: Neon Project Setup - Research

## Overview

This document summarizes research on setting up a Neon PostgreSQL project, including account creation, project management, connection pooling, and SSL/TLS configuration.

---

## 1. Account Creation & Sign-Up

**Source:** https://neon.com/docs/get-started-with-neon/signing-up

### Sign-Up Process

1. Navigate to https://console.neon.tech/signup
2. Choose authentication method:
   - Email
   - GitHub
   - Google
   - Partner accounts (Azure, etc.)

### Account Plans

- **Free Tier**: Available for all new users
- **Paid Plans**: Additional features and resources (see Neon pricing docs)

### Initial Setup Flow

1. Complete registration
2. Create first **Project** (required during onboarding)
3. Default resources provisioned automatically:
   - `production` branch (root default branch)
   - Database instance
   - Default role
   - Compute instance

### Project Philosophy

Neon recommends **one project per application repository** to manage database branches similarly to code version control.

---

## 2. Project Management

**Source:** https://neon.com/docs/manage/projects

### What is a Neon Project?

A project is the top-level container that holds:
- Branches (environments, features, previews)
- Databases
- Roles
- Computes
- Replicas

### Default Resources (Auto-Provisioned)

| Resource | Default Value |
|----------|---------------|
| Root Branch | `production` (Console) or `main` (API/CLI) |
| Primary Compute | Single read-write compute instance |
| Database | `neondb` (default name) |
| Role | `neondb_owner` (default owner role) |
| Storage | 0.5 GB (Free plan), up to 16 TB per branch (paid) |

### Creating a New Project

**Via Console:**
1. Go to https://console.neon.tech
2. Click **New Project**
3. Configure:
   - **Project name** (64-character limit)
   - **PostgreSQL version** (choose from available versions)
   - **Cloud provider** (AWS)
   - **Region** (select closest to your users)

**Quick Creation:** Visit https://pg.new for streamlined setup

### Project Settings

| Setting | Purpose |
|---------|---------|
| General | Rename project, view project ID |
| Compute | Set default sizing for new branches |
| Instant Restore | Configure point-in-time recovery window |
| Updates | Schedule PostgreSQL and Neon maintenance |
| Collaborators | Grant external users project access |
| Network Security | IP allowlisting, VPC connectivity |
| Logical Replication | Enable data replication to external services |
| Data API | Convert tables to REST endpoints |
| Delete | Permanently remove project (irreversible) |

### Compute Configuration

**Compute Units (CUs):**
- 1 CU = ~4 GB RAM + associated CPU + local SSD
- Fixed size: 0.25-56 CUs
- Autoscaling: min/max bounds (0.25-16 CUs)

**Free Tier Recommendation:** Start with 0.25 CU (minimal resources)

### IP Allow Configuration

Restrict database access by approved IPs:
- Individual: `192.0.2.1`
- Range: `198.51.100.20-198.51.100.50`
- CIDR: `203.0.113.0/24`
- IPv6 (AWS only): `2001:DB8:5432::/48`

### Project Deletion & Recovery

- Deletion is **permanent** but recoverable within **7 days** via API/CLI
- Deleting all projects does NOT stop billing (must downgrade to Free plan)

---

## 3. Connection Pooling (PgBouncer)

**Source:** https://neon.com/docs/connect/connection-pooling

### Overview

Neon uses **PgBouncer** for connection pooling, supporting up to **10,000 concurrent connections**.

### Connection String Formats

**Pooled Connection (recommended for applications):**
```
postgresql://user:password@ep-name-pooler.region.aws.neon.tech/dbname
```

**Direct Connection (for migrations/replication):**
```
postgresql://user:password@ep-name.region.aws.neon.tech/dbname
```

**Key Difference:** Pooled connections include `-pooler` in the endpoint hostname.

### Port Numbers

| Connection Type | Port |
|-----------------|------|
| Pooled | 5432 (default) |
| Direct | 5432 (default) |

The endpoint hostname determines pooled vs direct, not the port.

### PgBouncer Configuration

```ini
pool_mode=transaction
max_client_conn=10000
default_pool_size=0.9 * max_connections
max_prepared_statements=1000
query_wait_timeout=120
```

**Pool Mode:** `transaction` - connections pooled per transaction, not per session.

### When to Use Pooled Connections

**Use pooled connections for:**
- Web applications
- Serverless functions
- Any application with many short-lived connections

### When to Use Direct Connections

**Use direct connections for:**
- Schema migrations (Prisma, Drizzle, etc.)
- Logical replication (CDC tools like Fivetran)
- Commands requiring session persistence (`SET`, `LISTEN`)
- Interactive debugging

### Transaction Mode Limitations

Pooled connections do **NOT** support:
- `SET`/`RESET` statements
- `LISTEN`
- SQL-level `PREPARE`/`DEALLOCATE`
- Cursor operations with `HOLD`
- Session-level advisory locks
- `LOAD` statements

**Note:** Protocol-level prepared statements (via client libraries) ARE supported with PgBouncer 1.22.0+.

---

## 4. SSL/TLS Configuration

**Source:** https://neon.com/docs/connect/connect-securely

### Requirement

**SSL/TLS is MANDATORY for all Neon connections.** Unencrypted connections are rejected.

### sslmode Options

| Mode | Security Level | Description |
|------|----------------|-------------|
| `require` | Basic | Encryption required, certificate verified |
| `verify-ca` | Medium | + Validates CA signature |
| `verify-full` | **Recommended** | + Hostname verification, expiration checks, revocation checks |

### Best Practice

**Always use `sslmode=verify-full`** for maximum protection against man-in-the-middle attacks.

### Enhanced Security: Channel Binding

Add `channel_binding=require` for SCRAM-SHA-256-PLUS mutual authentication:
```
?sslmode=verify-full&channel_binding=require
```

### Certificate Information

- Neon uses **Let's Encrypt ISRG Root X1** certificate
- Most operating systems include this in root certificate stores
- No manual certificate download required in typical scenarios

### Root Certificate Paths by OS

| OS | Path |
|----|------|
| Debian/Ubuntu | `/etc/ssl/certs/ca-certificates.crt` |
| RHEL/CentOS | `/etc/pki/tls/certs/ca-bundle.crt` |
| macOS | System Keychain (automatic) |
| Windows | Built-in roots (may need Mozilla CA bundle for C/PHP) |

---

## 5. Environment Variable Naming Conventions

### Recommended Environment Variables

```bash
# Primary pooled connection (for application use)
DATABASE_URL="postgresql://user:password@ep-name-pooler.region.aws.neon.tech/neondb?sslmode=require"

# Direct connection (for migrations)
DATABASE_URL_UNPOOLED="postgresql://user:password@ep-name.region.aws.neon.tech/neondb?sslmode=require"

# Individual components (if needed)
PGHOST="ep-name-pooler.region.aws.neon.tech"
PGHOST_UNPOOLED="ep-name.region.aws.neon.tech"
PGDATABASE="neondb"
PGUSER="neondb_owner"
PGPASSWORD="your-password"
PGSSLMODE="require"
```

### Prisma-Specific Variables

```bash
# Prisma connection (pooled for queries)
DATABASE_URL="postgresql://user:password@ep-name-pooler.region.aws.neon.tech/neondb?sslmode=require"

# Prisma migrations (direct connection required)
DIRECT_URL="postgresql://user:password@ep-name.region.aws.neon.tech/neondb?sslmode=require"
```

### Drizzle-Specific Variables

```bash
# Drizzle connection (pooled)
DATABASE_URL="postgresql://user:password@ep-name-pooler.region.aws.neon.tech/neondb?sslmode=require"

# Drizzle migrations (direct)
DATABASE_URL_MIGRATE="postgresql://user:password@ep-name.region.aws.neon.tech/neondb?sslmode=require"
```

---

## 6. Step-by-Step Project Setup

### Phase 1: Account & Project Creation

1. **Sign up** at https://console.neon.tech/signup
2. **Create project** with settings:
   - Name: `business-website` (or your app name)
   - PostgreSQL version: Latest stable (e.g., 16)
   - Region: Choose closest to your users (e.g., `us-east-1`)
3. **Note project details:**
   - Project ID
   - Default branch name (`main` or `production`)
   - Default database name (`neondb`)
   - Default role (`neondb_owner`)

### Phase 2: Connection String Setup

1. **Get connection strings** from Neon Console > Connection Details
2. **Toggle "Pooled connection"** to get both formats
3. **Copy both strings:**
   - Pooled: For application runtime
   - Direct: For migrations

### Phase 3: Environment Configuration

1. **Create/update `.env.local`:**
   ```bash
   # Pooled connection for application
   DATABASE_URL="postgresql://..."

   # Direct connection for migrations
   DATABASE_URL_UNPOOLED="postgresql://..."
   ```

2. **Update `.env.example`:**
   ```bash
   DATABASE_URL="postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
   DATABASE_URL_UNPOOLED="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
   ```

### Phase 4: Verify Connection

```bash
# Test with psql (if installed)
psql "$DATABASE_URL" -c "SELECT version();"

# Or use Neon Console SQL Editor
```

---

## 7. Summary & Recommendations

### Key Decisions for This Project

| Decision | Recommendation | Rationale |
|----------|----------------|-----------|
| Connection pooling | Yes, use pooled | Next.js serverless functions create many connections |
| sslmode | `require` (minimum) | Mandatory for Neon; `verify-full` for production |
| Migration connection | Direct (unpooled) | Prisma/Drizzle migrations need session persistence |
| Compute size | 0.25 CU (start) | Scale up as needed; autoscaling available |
| Branch strategy | One branch per environment | main=production, dev branches for features |

### Connection String Checklist

- [ ] Pooled connection for `DATABASE_URL`
- [ ] Direct connection for `DATABASE_URL_UNPOOLED` (or `DIRECT_URL`)
- [ ] `sslmode=require` parameter included
- [ ] Both strings stored in `.env.local`
- [ ] `.env.example` updated with template
- [ ] Environment variables added to Vercel/hosting platform

### Security Checklist

- [ ] IP allowlisting configured (if needed)
- [ ] SSL mode set to `require` or `verify-full`
- [ ] Connection strings NOT committed to git
- [ ] Different credentials for production vs development
- [ ] Service role credentials secured (if using)

---

## Sources

1. Neon Sign-Up Guide: https://neon.com/docs/get-started-with-neon/signing-up
2. Neon Project Management: https://neon.com/docs/manage/projects
3. Neon Connection Pooling: https://neon.com/docs/connect/connection-pooling
4. Neon Secure Connections: https://neon.com/docs/connect/connect-securely
