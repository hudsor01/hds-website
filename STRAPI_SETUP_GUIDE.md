# 🚀 Strapi CMS Setup Guide

## Overview
This guide will help you set up Strapi CMS for managing your blog content. Strapi will run as a separate backend service that your Next.js app connects to via API.

---

## 📋 Prerequisites

- Node.js 18-22 (Strapi doesn't support Node 24 yet)
- PostgreSQL or SQLite (for Strapi database)
- A separate folder/repo for Strapi backend

---

## 🛠️ Option 1: Quick Local Setup (Development)

### Step 1: Create Strapi Backend
```bash
# In a separate directory (not inside your Next.js project)
cd ~/Developer
npx create-strapi@latest hds-strapi --quickstart

# This will:
# - Create a new Strapi project
# - Set up SQLite database (for dev)
# - Start Strapi on http://localhost:1337
```

### Step 2: Create Admin Account
1. Navigate to http://localhost:1337/admin
2. Create your admin account
3. Save credentials securely

### Step 3: Create Content Types

#### Blog Post Content Type
1. Go to Content-Type Builder
2. Create new Collection Type: `BlogPost`
3. Add fields:
   - `title` (Text, Required)
   - `slug` (UID, Based on title)
   - `excerpt` (Text, Required)
   - `content` (Rich Text, Required)
   - `featured` (Boolean, Default: false)
   - `publishedAt` (Datetime)
   - `featuredImage` (Media, Single)
   - `author` (Relation to User)
   - `category` (Relation to Category)
   - `tags` (Relation to Tags, Many)
   - `seo` (Component):
     - `metaTitle` (Text)
     - `metaDescription` (Text)
     - `keywords` (Text)
     - `metaImage` (Media)

#### Category Content Type
1. Create Collection Type: `Category`
2. Add fields:
   - `name` (Text, Required)
   - `slug` (UID, Based on name)
   - `description` (Text)

#### Tag Content Type
1. Create Collection Type: `Tag`
2. Add fields:
   - `name` (Text, Required)
   - `slug` (UID, Based on name)

### Step 4: Set Permissions
1. Go to Settings → Roles → Public
2. For BlogPost, Category, Tag:
   - Enable `find` and `findOne`
3. Save

### Step 5: Create API Token
1. Go to Settings → API Tokens
2. Create new token:
   - Name: "Next.js Frontend"
   - Type: "Read-only"
   - Duration: Unlimited
3. Copy the token

---

## 🌐 Option 2: Production Setup (Recommended)

### Using Strapi Cloud (Easiest)
```bash
# Create Strapi project
npx create-strapi@latest hds-strapi

# Deploy to Strapi Cloud
cd hds-strapi
npm run strapi deploy
```

### Using Railway/Render (Self-hosted)

#### Railway Setup:
1. Create account at railway.app
2. New Project → Deploy from GitHub
3. Add PostgreSQL database
4. Deploy Strapi with environment variables:
```env
DATABASE_CLIENT=postgres
DATABASE_HOST=${{PGHOST}}
DATABASE_PORT=${{PGPORT}}
DATABASE_NAME=${{PGDATABASE}}
DATABASE_USERNAME=${{PGUSER}}
DATABASE_PASSWORD=${{PGPASSWORD}}
DATABASE_SSL=true
JWT_SECRET=your-jwt-secret
ADMIN_JWT_SECRET=your-admin-jwt-secret
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your-api-token-salt
```

---

## 🔧 Next.js Integration

### Step 1: Environment Variables
Add to `.env.local`:
```env
# Strapi Configuration
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337  # Or your production URL
STRAPI_API_TOKEN=your-api-token-from-strapi
```

### Step 2: Update Blog Pages

Create `/app/blog/[slug]/page.tsx`:
```typescript
import { getBlogPost, getRelatedPosts } from '@/lib/strapi';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  
  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(
    params.slug,
    post.attributes.category?.data?.attributes?.slug
  );

  return (
    <article>
      <h1>{post.attributes.title}</h1>
      <BlocksRenderer content={post.attributes.content} />
      {/* Related posts, etc. */}
    </article>
  );
}

export async function generateStaticParams() {
  const { posts } = await getBlogPosts({ pageSize: 100 });
  return posts.map((post) => ({
    slug: post.attributes.slug,
  }));
}
```

Update `/app/blog/page.tsx`:
```typescript
import { getBlogPosts } from '@/lib/strapi';

export default async function BlogIndex() {
  const { posts, pagination } = await getBlogPosts();
  
  return (
    <div>
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

---

## 📝 Content Migration

### Migrate Existing Blog Posts to Strapi

1. **Manual Migration (Small number of posts):**
   - Copy content from existing blog posts
   - Create new entries in Strapi admin
   - Upload images to Media Library

2. **Automated Migration (Many posts):**
```typescript
// scripts/migrate-to-strapi.ts
import { createStrapiPost } from '@/lib/strapi-admin';

const posts = [
  {
    title: "How to Increase Website Conversion Rates",
    slug: "how-to-increase-website-conversion-rates-2025-guide",
    content: "...", // Your existing content
    // ... other fields
  }
];

for (const post of posts) {
  await createStrapiPost(post);
}
```

---

## 🎨 Strapi Admin Customization

### Custom Fields & Plugins
```bash
# Install useful plugins
cd hds-strapi
npm install @strapi/plugin-seo @strapi/plugin-sitemap
```

### Configure Plugins
In `config/plugins.js`:
```javascript
module.exports = {
  seo: {
    enabled: true,
  },
  sitemap: {
    enabled: true,
    config: {
      cron: '0 0 0 * * *',
      limit: 5000,
      xsl: true,
    },
  },
};
```

---

## 🚀 Deployment Checklist

### Strapi Backend:
- [ ] Deploy Strapi to production (Railway/Render/Strapi Cloud)
- [ ] Configure production database (PostgreSQL)
- [ ] Set up CDN for media files (Cloudinary/AWS S3)
- [ ] Enable API rate limiting
- [ ] Configure CORS for your domain
- [ ] Set up webhook for ISR (Incremental Static Regeneration)

### Next.js Frontend:
- [ ] Update environment variables in Vercel
- [ ] Configure ISR for blog pages
- [ ] Set up preview mode for draft posts
- [ ] Add webhook endpoint for cache revalidation

---

## 📊 Benefits of Strapi

### For Content Editors:
- ✅ User-friendly admin panel
- ✅ Rich text editor with media management
- ✅ Draft/publish workflow
- ✅ SEO fields built-in
- ✅ Multi-language support (with i18n plugin)

### For Developers:
- ✅ RESTful & GraphQL APIs
- ✅ Customizable content types
- ✅ Webhook support
- ✅ Plugin ecosystem
- ✅ TypeScript support

### For Performance:
- ✅ Static generation with ISR
- ✅ API response caching
- ✅ CDN-friendly architecture
- ✅ Optimized queries with population control

---

## 🔍 Testing the Integration

```bash
# Test API connection
curl http://localhost:1337/api/blog-posts

# Test in Next.js
npm run dev
# Visit http://localhost:3000/blog
```

---

## 📚 Resources

- [Strapi Documentation](https://docs.strapi.io)
- [Strapi + Next.js Tutorial](https://strapi.io/blog/nextjs-react-strapi-tutorial)
- [Strapi Cloud Pricing](https://strapi.io/pricing-cloud)
- [Railway Deployment Guide](https://docs.railway.app/guides/strapi)

---

## 💡 Pro Tips

1. **Use Preview Mode**: Set up Next.js preview mode for draft content
2. **Implement Webhooks**: Auto-rebuild when content changes
3. **Cache Strategy**: Use ISR with revalidation for optimal performance
4. **Image Optimization**: Use Cloudinary or similar for automatic image optimization
5. **Backup Strategy**: Regular database backups for content protection

---

## 🎯 Next Steps

1. Set up Strapi backend (choose local or cloud)
2. Create content types as specified
3. Migrate existing blog content
4. Update Next.js blog pages to use Strapi API
5. Deploy and test

With Strapi, you'll have a professional CMS that scales with your business while maintaining excellent performance!