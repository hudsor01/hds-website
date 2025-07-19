import { writeFileSync } from 'fs';
import { join } from 'path';

function generateSitemap(): string {
  const baseUrl = 'https://hudsondigitalsolutions.com';
  const currentDate = new Date().toISOString();

  // Static pages with their properties
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'weekly' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/services', priority: '0.9', changefreq: 'weekly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' },
    { url: '/blog', priority: '0.7', changefreq: 'daily' },
  ];

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
}

// Generate and write sitemap
try {
  const sitemap = generateSitemap();
  const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml');
  writeFileSync(sitemapPath, sitemap, 'utf-8');
  console.log('✅ Sitemap generated successfully at:', sitemapPath);
} catch (error) {
  console.error('❌ Failed to generate sitemap:', error);
  process.exit(1);
}