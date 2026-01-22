# Phase 21: Drizzle Schema Creation - Research

## Overview

This document contains comprehensive research on Drizzle ORM implementation for the Hudson Digital Solutions business website. The goal is to create type-safe database schemas that mirror the existing Supabase PostgreSQL tables.

---

## 1. Drizzle ORM Getting Started

### Installation

```bash
# Core dependencies
bun add drizzle-orm

# Development dependencies
bun add -D drizzle-kit
```

**Note:** Since this project uses Bun runtime (packageManager: "bun@1.3.6"), we use the native Bun.SQL driver which is already built-in.

### Schema File Structure

Drizzle supports flexible schema organization:

**Single file approach** - For smaller projects:
```
src/lib/schema.ts
```

**Multi-file approach** - Recommended for this project given the number of tables:
```
src/lib/schema/
  index.ts           # Re-exports all schemas
  scheduled-emails.ts
  projects.ts
  leads.ts
  analytics.ts
  testimonials.ts
  help-articles.ts
  ttl-calculations.ts
  ...
```

### Basic Table Definition Pattern

```typescript
import { pgTable, uuid, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  email: text().notNull().unique(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
```

---

## 2. Bun.SQL Driver Connection

### Native Bun Integration

Drizzle natively supports Bun's SQL module for PostgreSQL with excellent performance:

```typescript
import { drizzle } from 'drizzle-orm/bun-sql';

// Option 1: Direct URL connection (recommended)
const db = drizzle(process.env.DATABASE_URL);

// Option 2: Custom driver instance
import { SQL } from 'bun';
const client = new SQL(process.env.DATABASE_URL);
const db = drizzle({ client });
```

### Connection Configuration for This Project

```typescript
// src/lib/db.ts
import { drizzle } from 'drizzle-orm/bun-sql';
import * as schema from './schema';

export const db = drizzle(process.env.DATABASE_URL!, { schema });
```

---

## 3. Schema Declaration Patterns

### Column Types for PostgreSQL

| Drizzle Type | PostgreSQL | Usage |
|--------------|------------|-------|
| `uuid()` | UUID | Primary keys |
| `text()` | TEXT | Variable-length strings |
| `varchar({ length: 255 })` | VARCHAR(255) | Fixed-length strings |
| `integer()` | INTEGER | Numbers |
| `boolean()` | BOOLEAN | True/false |
| `timestamp({ withTimezone: true })` | TIMESTAMPTZ | Timestamps |
| `jsonb()` | JSONB | JSON data |
| `serial()` | SERIAL | Auto-increment |
| `numeric({ precision: 10, scale: 2 })` | NUMERIC(10,2) | Decimal |

### Naming Convention: snake_case Mapping

For TypeScript camelCase to PostgreSQL snake_case:

```typescript
// Option 1: Global casing configuration
const db = drizzle({
  connection: process.env.DATABASE_URL,
  casing: 'snake_case'
});

// Option 2: Explicit column aliasing
const users = pgTable("users", {
  firstName: text('first_name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**Recommendation:** Use explicit column aliasing for clarity and control.

### Constraints and Modifiers

```typescript
// Common modifiers
column.notNull()              // NOT NULL
column.unique()               // UNIQUE constraint
column.primaryKey()           // PRIMARY KEY
column.default(value)         // DEFAULT value
column.defaultRandom()        // DEFAULT gen_random_uuid()
column.defaultNow()           // DEFAULT NOW()
column.references(() => other.id)  // Foreign key

// Check constraints via table config
export const projects = pgTable("projects", {
  category: text('category').notNull(),
}, (table) => [
  check("category_check", sql`${table.category} IN ('SaaS Platform', 'Business Website')`),
]);
```

### Foreign Keys

```typescript
import { pgTable, uuid, integer } from "drizzle-orm/pg-core";

export const leadNotes = pgTable("lead_notes", {
  id: uuid().primaryKey().defaultRandom(),
  leadId: uuid('lead_id').notNull().references(() => calculatorLeads.id, { onDelete: 'cascade' }),
  content: text().notNull(),
});
```

### Indexes

```typescript
import { pgTable, index, uniqueIndex } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: uuid().primaryKey().defaultRandom(),
  slug: text().notNull(),
  published: boolean().default(true),
}, (table) => [
  uniqueIndex("idx_projects_slug").on(table.slug),
  index("idx_projects_published").on(table.published).where(sql`${table.published} = true`),
]);
```

### PostgreSQL-Specific Features

**Schemas (namespaces):**
```typescript
import { pgSchema } from "drizzle-orm/pg-core";

export const publicSchema = pgSchema('public');
export const users = publicSchema.table('users', { /* columns */ });
```

**Enums:**
```typescript
import { pgEnum } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["pending", "sent", "failed"]);
export const scheduledEmails = pgTable("scheduled_emails", {
  status: statusEnum().default("pending"),
});
```

### Reusable Column Patterns

```typescript
// Common timestamp columns
const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};

// Apply to tables
export const projects = pgTable('projects', {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  ...timestamps,
});
```

---

## 4. Type Inference

### $inferSelect and $inferInsert

Three equivalent methods to extract types:

```typescript
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Method 1: Direct property access (recommended)
type SelectProject = typeof projects.$inferSelect;
type InsertProject = typeof projects.$inferInsert;

// Method 2: Underscore notation
type SelectProject = typeof projects._.$inferSelect;
type InsertProject = typeof projects._.$inferInsert;

// Method 3: Type helpers
type SelectProject = InferSelectModel<typeof projects>;
type InsertProject = InferInsertModel<typeof projects>;
```

### Practical Usage

```typescript
// Schema definition
export const projects = pgTable("projects", {
  id: uuid().primaryKey().defaultRandom(),
  slug: text().notNull().unique(),
  title: text().notNull(),
  published: boolean().default(true),
});

// Inferred types
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// Usage in functions
async function createProject(data: NewProject): Promise<Project> {
  const [project] = await db.insert(projects).values(data).returning();
  return project;
}
```

### Column Retrieval for Partial Selects

```typescript
import { getTableColumns } from "drizzle-orm";

const { password, ...safeColumns } = getTableColumns(users);
const users = await db.select(safeColumns).from(users);
```

---

## 5. drizzle-kit Configuration

### drizzle.config.ts

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  // Required
  dialect: "postgresql",
  schema: "./src/lib/schema",  // or "./src/lib/schema.ts" for single file

  // Output for migrations
  out: "./drizzle",

  // Database connection
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  // Optional settings
  verbose: true,
  strict: true,

  // Introspection settings
  introspect: {
    casing: "camel",  // Convert snake_case to camelCase
  },

  // Table filtering
  tablesFilter: ["*"],
  schemaFilter: ["public"],
});
```

### Commands

| Command | Purpose |
|---------|---------|
| `drizzle-kit generate` | Generate SQL migration files from schema |
| `drizzle-kit migrate` | Apply generated migrations to database |
| `drizzle-kit push` | Push schema directly (no migration files) |
| `drizzle-kit pull` | Introspect existing database to generate schema |
| `drizzle-kit studio` | Launch Drizzle Studio GUI |
| `drizzle-kit check` | Validate migrations |

### Introspection from Existing Database

Since this project has existing Supabase tables, use `drizzle-kit pull`:

```bash
# Generate schema from existing database
npx drizzle-kit pull

# With config file
npx drizzle-kit pull --config=drizzle.config.ts
```

**Pull command options:**
- `--init` - Mark pulled schema as initial migration
- `introspect.casing: "camel"` - Convert snake_case to camelCase

---

## 6. Existing Database Schema Summary

Based on the migration files, these tables exist in the database:

### Core Tables

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `scheduled_emails` | Email queue for delayed delivery | id, recipient_email, sequence_id, scheduled_for, status |
| `projects` | Portfolio projects | id, slug, title, category, published, featured |
| `calculator_leads` | Leads from interactive calculators | id, email, calculator_type, inputs, results, lead_score |
| `lead_notes` | Admin notes on leads | id, lead_id (FK), note_type, content |
| `newsletter_subscribers` | Email subscriptions | id, email, status, source |
| `case_studies` | Detailed project case studies | id, slug, client_name, industry, metrics |
| `testimonial_requests` | Private testimonial links | id, token, client_name, expires_at |
| `testimonials` | Submitted testimonials | id, client_name, rating, content, approved |
| `help_articles` | Knowledge base articles | id, slug, category, title, content |
| `ttl_calculations` | TTL calculator saved results | id, share_code, inputs, results |

### Analytics Tables

| Table | Description |
|-------|-------------|
| `email_engagement` | Email opens, clicks, bounces |
| `lead_attribution` | Marketing attribution tracking |
| `faq_interactions` | FAQ usage analytics |
| `location_pages` | Local SEO pages |
| `leads` | General lead tracking |
| `web_vitals` | Performance metrics |
| `custom_events` | Analytics events |
| `page_analytics` | Page view tracking |
| `conversion_funnel` | Conversion tracking |
| `error_logs` | Application errors |

### Supporting Tables

| Table | Description |
|-------|-------------|
| `cron_logs` | Cron job execution logs |
| `processing_queue` | Background job queue |
| `webhook_logs` | Webhook event logs |

---

## 7. Implementation Recommendations

### Directory Structure

```
src/lib/
  db.ts                    # Database client initialization
  schema/
    index.ts               # Re-exports all schemas
    common.ts              # Shared patterns (timestamps, enums)
    scheduled-emails.ts    # Email scheduling
    projects.ts            # Portfolio projects
    case-studies.ts        # Case studies
    leads.ts               # Calculator leads, lead notes
    testimonials.ts        # Testimonials system
    newsletter.ts          # Newsletter subscribers
    help-articles.ts       # Help/knowledge base
    ttl-calculations.ts    # TTL calculator
    analytics.ts           # Analytics tables (combined)
    error-logs.ts          # Error logging
    system.ts              # Cron, webhooks, processing queue
```

### Common Patterns Module

```typescript
// src/lib/schema/common.ts
import { timestamp, uuid } from "drizzle-orm/pg-core";

// Standard ID column
export const idColumn = {
  id: uuid().primaryKey().defaultRandom(),
};

// Standard timestamps
export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};

// Audit timestamps
export const auditTimestamps = {
  ...timestamps,
  publishedAt: timestamp('published_at', { withTimezone: true }),
};

// Common enums
export const emailStatusEnum = pgEnum("email_status", ["pending", "sent", "failed"]);
export const leadQualityEnum = pgEnum("lead_quality", ["hot", "warm", "cold"]);
```

### Type Export Pattern

```typescript
// src/lib/schema/projects.ts
import { pgTable, uuid, text, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { timestamps } from "./common";

export const projects = pgTable("projects", {
  id: uuid().primaryKey().defaultRandom(),
  slug: text().notNull().unique(),
  title: text().notNull(),
  category: text().notNull(),
  description: text().notNull(),
  imageUrl: text('image_url').notNull(),
  stats: jsonb().notNull().default({}),
  techStack: text('tech_stack').array().notNull().default([]),
  featured: boolean().default(false),
  published: boolean().default(true),
  displayOrder: integer('display_order').default(0),
  viewCount: integer('view_count').default(0),
  ...timestamps,
});

// Type exports
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
```

### Migration Strategy

**Option A: Introspect then manage (recommended)**
1. Use `drizzle-kit pull` to generate schema from existing database
2. Review and clean up generated schema
3. Use `drizzle-kit push` for future changes (simple)
4. Or use `drizzle-kit generate` + `drizzle-kit migrate` for version-controlled migrations

**Option B: Manual schema creation**
1. Manually write schemas matching existing tables
2. Use `drizzle-kit push` to verify alignment
3. Continue with push or migrate workflow

### Package.json Scripts

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:pull": "drizzle-kit pull",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## 8. Key Decisions to Make

1. **Schema organization**: Single file vs multi-file (recommend multi-file)
2. **Casing strategy**: Manual aliasing vs global casing option
3. **Migration workflow**: Push (simpler) vs Generate+Migrate (version controlled)
4. **Initial approach**: Introspect existing DB vs manual schema creation
5. **Type export location**: Co-located with schema vs separate types folder

---

## 9. References

- [Drizzle ORM Getting Started (PostgreSQL)](https://orm.drizzle.team/docs/get-started/postgresql-new)
- [Bun.SQL Driver](https://orm.drizzle.team/docs/connect-bun-sql)
- [Schema Declaration](https://orm.drizzle.team/docs/sql-schema-declaration)
- [drizzle-kit Overview](https://orm.drizzle.team/docs/kit-overview)
- [drizzle-kit Pull Command](https://orm.drizzle.team/docs/drizzle-kit-pull)
- [Configuration File Reference](https://orm.drizzle.team/docs/drizzle-config-file)
- [Type Inference Goodies](https://orm.drizzle.team/docs/goodies)
