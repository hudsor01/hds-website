const { env } = require('./src/env');

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: env.NEXT_PUBLIC_SITE_URL || 'https://hudsondigitalsolutions.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: [
    '/api/*',
    '/server-sitemap.xml',
    '/404',
    '/500',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api'],
      },
    ],
    additionalSitemaps: [
      'https://hudsondigitalsolutions.com/server-sitemap.xml',
    ],
  },
  transform: async (config, path) => {
    // Custom priority for specific pages
    const priorities = {
      '/': 1.0,
      '/contact': 0.9,
      '/services': 0.8,
      '/about': 0.7,
      '/blog': 0.6,
    };

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: priorities[path] || config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
};