# 01-01 Data Changes — Showcase Table Populate

**Date:** 2026-05-21
**DB:** Neon project `soft-bush-38066584`, database `neondb`, branch `br-rough-shape-afdj4aqj`
**Plan:** `.planning/phases/01-showcase-ui-redesign/01-01-PLAN.md`

## Pre-change snapshot

Query run:

```sql
SELECT slug, title, image_url, display_order, featured, published
FROM showcase
WHERE published = true
ORDER BY display_order ASC, created_at DESC;
```

Result (3 rows):

| slug                | title                       | image_url | display_order | featured | published |
| ------------------- | --------------------------- | --------- | ------------- | -------- | --------- |
| ink37-tattoos       | Ink 37 Tattoos              | NULL      | 1             | true     | true      |
| tenantflow          | TenantFlow                  | NULL      | 2             | true     | true      |
| richard-hudson-jr   | RevOps Consultant Portfolio | NULL      | 3             | false    | true      |

**MIN(display_order) across published rows:** `1`
**Computed new display_order for jirah-shop:** `0` (`MIN - 1 = 1 - 1 = 0`)

## Planned UPDATEs

Slug → image mapping resolved against the live SELECT above:

| Title                       | Live slug         | imageUrl                             |
| --------------------------- | ----------------- | ------------------------------------ |
| Ink 37 Tattoos              | ink37-tattoos     | /images/showcase/ink37-tattoos.jpg   |
| TenantFlow                  | tenantflow        | /images/showcase/tenantflow.jpg      |
| RevOps Consultant Portfolio | richard-hudson-jr | /images/showcase/revops-portfolio.jpg |

UPDATE statements to run (one at a time, in order):

```sql
UPDATE showcase SET image_url = '/images/showcase/ink37-tattoos.jpg', updated_at = NOW() WHERE slug = 'ink37-tattoos';
UPDATE showcase SET image_url = '/images/showcase/tenantflow.jpg', updated_at = NOW() WHERE slug = 'tenantflow';
UPDATE showcase SET image_url = '/images/showcase/revops-portfolio.jpg', updated_at = NOW() WHERE slug = 'richard-hudson-jr';
```

## Planned INSERT

The jirah-shop row uses the values confirmed in Task 1:

```sql
INSERT INTO showcase (
  slug, title, description,
  client_name, industry, project_type, category,
  showcase_type, technologies, metrics,
  image_url, external_link,
  featured, published, display_order,
  published_at, created_at, updated_at
) VALUES (
  'jirah-shop',
  'JirahShop',
  'Curated Asian beauty store featuring K-beauty and J-beauty essentials, own-brand formulations, and expertly selected picks for every skin type.',
  'JirahShop',
  'E-Commerce',
  'Online Store',
  'E-Commerce',
  'detailed',
  '["Next.js","Stripe","TypeScript","Sanity"]'::jsonb,
  '{"$50+":"Free shipping","100%":"Authentic products","Curated":"K-beauty picks"}'::jsonb,
  '/images/showcase/jirah-shop.jpg',
  'https://www.shopatjirah.com/',
  true,
  true,
  0,
  NOW(),
  NOW(),
  NOW()
);
```

## Executed statements

Executed via `@neondatabase/serverless` client against `DATABASE_URL_UNPOOLED` (Neon project `soft-bush-38066584`, db `neondb`, branch `br-rough-shape-afdj4aqj`). All statements returned successfully.

### UPDATEs (run one at a time)

```sql
UPDATE showcase SET image_url = '/images/showcase/ink37-tattoos.jpg', updated_at = NOW() WHERE slug = 'ink37-tattoos';
-- RETURNING: [{"slug":"ink37-tattoos","image_url":"/images/showcase/ink37-tattoos.jpg"}]

UPDATE showcase SET image_url = '/images/showcase/tenantflow.jpg', updated_at = NOW() WHERE slug = 'tenantflow';
-- RETURNING: [{"slug":"tenantflow","image_url":"/images/showcase/tenantflow.jpg"}]

UPDATE showcase SET image_url = '/images/showcase/revops-portfolio.jpg', updated_at = NOW() WHERE slug = 'richard-hudson-jr';
-- RETURNING: [{"slug":"richard-hudson-jr","image_url":"/images/showcase/revops-portfolio.jpg"}]
```

### INSERT

```sql
INSERT INTO showcase (
  slug, title, description,
  client_name, industry, project_type, category,
  showcase_type, technologies, metrics,
  image_url, external_link,
  featured, published, display_order,
  published_at, created_at, updated_at
) VALUES (
  'jirah-shop',
  'JirahShop',
  'Curated Asian beauty store featuring K-beauty and J-beauty essentials, own-brand formulations, and expertly selected picks for every skin type.',
  'JirahShop',
  'E-Commerce',
  'Online Store',
  'E-Commerce',
  'detailed',
  '["Next.js","Stripe","TypeScript","Sanity"]'::jsonb,
  '{"$50+":"Free shipping","100%":"Authentic products","Curated":"K-beauty picks"}'::jsonb,
  '/images/showcase/jirah-shop.jpg',
  'https://www.shopatjirah.com/',
  true,
  true,
  0,
  NOW(),
  NOW(),
  NOW()
);
-- RETURNING (selected fields):
-- {
--   "slug": "jirah-shop",
--   "title": "JirahShop",
--   "display_order": 0,
--   "featured": true,
--   "published": true,
--   "showcase_type": "detailed",
--   "image_url": "/images/showcase/jirah-shop.jpg",
--   "technologies": ["Next.js","Stripe","TypeScript","Sanity"],
--   "metrics": {"$50+":"Free shipping","100%":"Authentic products","Curated":"K-beauty picks"}
-- }
```

## Post-change snapshot

Query run:

```sql
SELECT slug, title, image_url, featured, published, display_order
FROM showcase
WHERE published = true
ORDER BY display_order ASC, created_at DESC;
```

Result (4 rows — jirah-shop first as expected):

| slug              | title                       | image_url                              | featured | published | display_order |
| ----------------- | --------------------------- | -------------------------------------- | -------- | --------- | ------------- |
| jirah-shop        | JirahShop                   | /images/showcase/jirah-shop.jpg        | true     | true      | 0             |
| ink37-tattoos     | Ink 37 Tattoos              | /images/showcase/ink37-tattoos.jpg     | true     | true      | 1             |
| tenantflow        | TenantFlow                  | /images/showcase/tenantflow.jpg        | true     | true      | 2             |
| richard-hudson-jr | RevOps Consultant Portfolio | /images/showcase/revops-portfolio.jpg  | false    | true      | 3             |

## Acceptance verification

- 4 published rows: yes
- All rows have non-null `image_url` matching `/images/showcase/{ink37-tattoos|tenantflow|revops-portfolio|jirah-shop}.jpg`: yes
- jirah-shop sorts first (lowest `display_order = 0`): yes
- jirah-shop `featured = true`, `published = true`, `showcase_type = 'detailed'`: yes
- Pre-existing rows' `slug`, `title`, `featured`, `display_order` unchanged vs pre-change snapshot (only `image_url` and `updated_at` differ): yes

