# Ghost CMS Integration Guide

This document provides instructions for setting up and using the Ghost CMS integration in the Hudson Digital Solutions website.

## Overview

The website now uses Ghost CMS as the content management system for the blog. Ghost CMS is a powerful, open-source publishing platform that provides a clean admin interface for managing blog content.

## Quick Start

### 1. Get Your Ghost Content API Key

1. Visit your Ghost admin panel: https://blog.thehudsonfam.com/ghost
2. Go to Settings → Integrations
3. Click "Add custom integration"
4. Give it a name (e.g., "Next.js Website")
5. Copy the **Content API Key** (not the Admin API Key)

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
GHOST_API_URL=https://blog.thehudsonfam.com
GHOST_CONTENT_API_KEY=your_actual_content_api_key_here
```

### 3. Test the Integration

Run the test script to verify everything is working:

```bash
node test-ghost-api.js
```

You should see output confirming that posts, tags, authors, and settings can be fetched successfully.

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000/blog to see your Ghost content rendered in Next.js.

## Architecture

### File Structure

```
src/
├── lib/
│   └── ghost.ts              # Ghost API client wrapper
├── types/
│   ├── ghost.d.ts            # Ghost Content API module declaration
│   └── ghost-types.ts        # TypeScript type definitions
├── components/
│   └── blog/
│       ├── BlogPostCard.tsx  # Post preview card component
│       ├── BlogPostContent.tsx # Full post content renderer
│       ├── AuthorCard.tsx    # Author bio and social links
│       ├── TagList.tsx       # Tag navigation component
│       └── RelatedPosts.tsx  # Related articles component
└── app/
    └── blog/
        ├── page.tsx          # Blog listing page
        ├── [slug]/
        │   └── page.tsx      # Individual blog post page
        ├── tag/[slug]/
        │   └── page.tsx      # Posts filtered by tag
        └── author/[slug]/
            └── page.tsx      # Posts filtered by author
```

### Key Components

#### Ghost API Client (`src/lib/ghost.ts`)

The Ghost API client provides type-safe wrapper functions for all Ghost Content API operations:

- `getPosts()` - Fetch paginated posts with options
- `getPostBySlug()` - Get a single post by slug
- `getPostsByTag()` - Filter posts by tag
- `getPostsByAuthor()` - Filter posts by author
- `getFeaturedPosts()` - Get featured posts only
- `getTags()` - Fetch all tags
- `getAuthors()` - Fetch all authors
- `searchPosts()` - Search posts by query

All functions include proper error handling and logging.

#### TypeScript Types (`src/types/ghost-types.ts`)

Complete type definitions for:
- `Post` - Blog post data
- `Author` - Author information
- `Tag` - Tag/category data
- `Settings` - Ghost site settings
- `BrowseOptions` - API query options

### Routes

#### `/blog`
- Main blog listing page
- Shows featured posts in a highlighted section
- Displays all posts in a grid layout
- Includes sidebar with topics and newsletter signup

#### `/blog/[slug]`
- Individual blog post page
- Full post content with syntax highlighting
- Author bio card
- Related posts based on tags
- SEO-optimized metadata

#### `/blog/tag/[slug]`
- Posts filtered by a specific tag
- Tag description and post count
- Grid layout of matching posts

#### `/blog/author/[slug]`
- Posts by a specific author
- Author profile with bio and social links
- Grid layout of author's posts

## Features

### Incremental Static Regeneration (ISR)

All blog pages use ISR with a 60-second revalidation period:

```typescript
export const revalidate = 60;
```

This means:
- Pages are statically generated at build time
- Content updates every 60 seconds automatically
- No full rebuild required for content changes
- Excellent performance with fresh content

### SEO Optimization

Every blog page includes:
- Dynamic meta titles and descriptions from Ghost
- OpenGraph tags for social sharing
- Twitter Card metadata
- Structured data (JSON-LD) for search engines
- Canonical URLs
- Proper heading hierarchy

### Image Handling

Ghost CMS images are rendered using standard `<img>` tags with ESLint exceptions because:
1. Ghost images are external URLs from the Ghost CDN
2. Next.js Image component requires domain configuration
3. Ghost handles image optimization on their end

### Error Handling

The integration includes comprehensive error handling:
- Failed API calls return empty arrays/null without crashing
- All errors are logged with context for debugging
- Fallback states for missing content
- Not found pages for invalid slugs

## Development Workflow

### Adding New Content

1. Log into Ghost admin: https://blog.thehudsonfam.com/ghost
2. Create a new post
3. Add content using Ghost's rich editor
4. Set tags, featured image, and SEO metadata
5. Publish the post
6. Wait up to 60 seconds for ISR to update the Next.js site

### Testing Locally

1. Ensure `.env.local` has valid Ghost API credentials
2. Run `npm run dev`
3. Visit http://localhost:3000/blog
4. Changes in Ghost will appear after the revalidation period

### Building for Production

```bash
npm run build
```

This will:
- Generate static pages for all published posts
- Fetch all tags and authors
- Create optimized bundles
- Prepare for deployment

## Troubleshooting

### Issue: "No articles found"

**Possible causes:**
- Invalid or missing `GHOST_CONTENT_API_KEY`
- Ghost CMS is not accessible
- No published posts in Ghost

**Solution:**
1. Run `node test-ghost-api.js` to diagnose
2. Check API key is set correctly
3. Verify Ghost CMS is accessible
4. Check Ghost admin for published posts

### Issue: "[object Object]" displaying

**Possible causes:**
- Object being rendered as string
- Missing type conversions

**Solution:**
- This has been resolved in the latest version
- All logger calls properly handle Error objects
- All map functions have proper type annotations

### Issue: Images not loading

**Possible causes:**
- Ghost CDN issues
- CORS restrictions
- Invalid image URLs

**Solution:**
1. Check browser console for errors
2. Verify image URLs in Ghost admin
3. Check Ghost CDN accessibility

### Issue: Build fails

**Possible causes:**
- Missing environment variables during build
- Ghost API unreachable during build
- Type errors

**Solution:**
1. Ensure environment variables are set in Vercel/deployment platform
2. Run `npm run typecheck` to check for type errors
3. Check Ghost API is accessible from build environment

## Performance

### Metrics

The Ghost integration is optimized for performance:
- Static generation at build time
- ISR for automatic content updates
- Minimal JavaScript payload
- Optimized images from Ghost CDN
- Efficient caching strategies

### Monitoring

Monitor performance using:
- Vercel Analytics dashboard
- PostHog analytics (configured in project)
- Web Vitals reporting (built into the site)

## Security

### API Keys

- **Content API Key**: Public, read-only, safe to use client-side
- **Admin API Key**: SECRET, never expose in client code

The integration only uses the Content API Key, which is safe for public use and only allows reading published content.

### HTTPS

All Ghost API requests use HTTPS for secure communication.

## Future Enhancements

Potential improvements for the Ghost integration:

1. **Comments** - Enable Ghost's built-in commenting system
2. **Newsletter** - Integrate Ghost's membership/newsletter features
3. **Search** - Add full-text search across all posts
4. **RSS Feed** - Generate RSS feed from Ghost content
5. **Analytics** - Track post views and engagement
6. **Draft Preview** - Allow previewing draft posts
7. **Image Optimization** - Configure Next.js Image for Ghost CDN

## Support

For issues or questions:
1. Check this documentation first
2. Run the test script: `node test-ghost-api.js`
3. Review Ghost CMS documentation: https://ghost.org/docs/content-api/
4. Check Next.js documentation: https://nextjs.org/docs

## Version History

- **v1.0.0** - Initial Ghost CMS integration
  - Basic post listing and display
  - Tag and author filtering
  - SEO optimization
  - ISR implementation
