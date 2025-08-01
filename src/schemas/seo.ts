import { z } from 'zod';
import { urlSchema } from './common';

// OpenGraph schema for next-seo
export const openGraphImageSchema = z.object({
  url: urlSchema,
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  alt: z.string().optional(),
  type: z.string().optional(),
  secureUrl: urlSchema.optional(),
});

export const openGraphSchema = z.object({
  type: z.enum([
    'website',
    'article',
    'book',
    'profile',
    'music.song',
    'music.album',
    'music.playlist',
    'music.radio_station',
    'video.movie',
    'video.episode',
    'video.tv_show',
    'video.other',
  ]).default('website'),
  title: z.string().optional(),
  description: z.string().optional(),
  url: urlSchema.optional(),
  siteName: z.string().optional(),
  images: z.array(openGraphImageSchema).optional(),
  locale: z.string().optional(),
  article: z.object({
    publishedTime: z.string().datetime().optional(),
    modifiedTime: z.string().datetime().optional(),
    expirationTime: z.string().datetime().optional(),
    authors: z.array(z.string()).optional(),
    section: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
});

// Twitter card schema
export const twitterSchema = z.object({
  handle: z.string().optional(),
  site: z.string().optional(),
  cardType: z.enum(['summary', 'summary_large_image', 'app', 'player']).optional(),
});

// SEO configuration schema
export const seoConfigSchema = z.object({
  title: z.string(),
  titleTemplate: z.string().optional(),
  defaultTitle: z.string().optional(),
  description: z.string(),
  canonical: urlSchema.optional(),
  mobileAlternate: z.object({
    media: z.string(),
    href: urlSchema,
  }).optional(),
  languageAlternates: z.array(z.object({
    hrefLang: z.string(),
    href: urlSchema,
  })).optional(),
  openGraph: openGraphSchema.optional(),
  twitter: twitterSchema.optional(),
  facebook: z.object({
    appId: z.string(),
  }).optional(),
  additionalMetaTags: z.array(z.object({
    name: z.string().optional(),
    content: z.string(),
    property: z.string().optional(),
    httpEquiv: z.string().optional(),
  })).optional(),
  additionalLinkTags: z.array(z.object({
    rel: z.string(),
    href: z.string(),
    sizes: z.string().optional(),
    type: z.string().optional(),
    color: z.string().optional(),
  })).optional(),
  robotsProps: z.object({
    nosnippet: z.boolean().optional(),
    notranslate: z.boolean().optional(),
    noimageindex: z.boolean().optional(),
    noarchive: z.boolean().optional(),
    maxSnippet: z.number().optional(),
    maxImagePreview: z.enum(['none', 'standard', 'large']).optional(),
    maxVideoPreview: z.number().optional(),
    unavailableAfter: z.string().optional(),
  }).optional(),
});

// Page-specific SEO metadata
export const pageSeoSchema = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.array(z.string()).optional(),
  openGraph: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    images: z.array(openGraphImageSchema).optional(),
  }).optional(),
  noindex: z.boolean().optional(),
  nofollow: z.boolean().optional(),
});

// Sitemap entry schema
export const sitemapEntrySchema = z.object({
  loc: urlSchema,
  lastmod: z.string().datetime().optional(),
  changefreq: z.enum([
    'always',
    'hourly',
    'daily',
    'weekly',
    'monthly',
    'yearly',
    'never',
  ]).optional(),
  priority: z.number().min(0).max(1).optional(),
  alternates: z.object({
    languages: z.record(z.string(), urlSchema).optional(),
  }).optional(),
});

// Type inference
export type SEOConfig = z.infer<typeof seoConfigSchema>;
export type PageSEO = z.infer<typeof pageSeoSchema>;
export type SitemapEntry = z.infer<typeof sitemapEntrySchema>;