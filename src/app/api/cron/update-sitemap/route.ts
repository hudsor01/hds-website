import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const sitemap = await generateSitemap();
    
    // Write sitemap to public directory
    const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml');
    await writeFile(sitemapPath, sitemap);

    return NextResponse.json({
      success: true,
      message: 'Sitemap updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sitemap update failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update sitemap',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

async function generateSitemap(): Promise<string> {
  const baseUrl = 'https://hudsondigitalsolutions.com';
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'weekly', lastmod: currentDate },
    { url: '/about', priority: '0.8', changefreq: 'monthly', lastmod: currentDate },
    { url: '/services', priority: '0.9', changefreq: 'weekly', lastmod: currentDate },
    { url: '/portfolio', priority: '0.9', changefreq: 'weekly', lastmod: currentDate },
    { url: '/pricing', priority: '0.8', changefreq: 'monthly', lastmod: currentDate },
    { url: '/contact', priority: '0.8', changefreq: 'monthly', lastmod: currentDate },
    { url: '/privacy', priority: '0.3', changefreq: 'yearly', lastmod: currentDate },
  ];

  // In a real implementation, you would fetch dynamic pages from your CMS/database:
  // const blogPosts = await fetchBlogPosts();
  // const dynamicPages = blogPosts.map(post => ({
  //   url: `/blog/${post.slug}`,
  //   priority: '0.7',
  //   changefreq: 'monthly',
  //   lastmod: post.updatedAt
  // }));

  const dynamicPages: Array<{ url: string; priority: string; changefreq: string; lastmod?: string }> = [];

  const allPages = [...staticPages, ...dynamicPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
}

// Protect this endpoint in production
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return GET();
}