import { NextResponse } from 'next/server';
import { applySecurityHeaders } from '@/middleware/security';

export async function GET() {
  try {
    const rss = await generateRSSFeed();
    
    const response = new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      }
    });
    
    // Apply security headers
    return applySecurityHeaders(response);
  } catch (error) {
    console.error('RSS feed generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate RSS feed' },
      { status: 500 }
    );
  }
}

async function generateRSSFeed(): Promise<string> {
  const baseUrl = 'https://hudsondigitalsolutions.com';
  const currentDate = new Date().toUTCString();

  // In a real implementation, you would fetch blog posts from Ghost CMS or database:
  // const posts = await ghost.posts.browse({
  //   limit: 50,
  //   include: ['tags', 'authors']
  // });

  // Mock blog posts for now
  const posts = [
    {
      title: 'Building Modern Web Applications with Next.js 15',
      slug: 'building-modern-web-applications-nextjs-15',
      excerpt: 'Learn how to leverage the latest features in Next.js 15 for building high-performance web applications.',
      published_at: '2024-01-15T10:00:00.000Z',
      updated_at: '2024-01-15T10:00:00.000Z',
      primary_author: {
        name: 'Hudson Digital Solutions Team'
      },
      primary_tag: {
        name: 'Web Development'
      }
    },
    {
      title: 'TypeScript Best Practices for Enterprise Applications',
      slug: 'typescript-best-practices-enterprise',
      excerpt: 'Discover TypeScript patterns and practices that scale for large enterprise applications.',
      published_at: '2024-01-10T10:00:00.000Z',
      updated_at: '2024-01-10T10:00:00.000Z',
      primary_author: {
        name: 'Hudson Digital Solutions Team'
      },
      primary_tag: {
        name: 'TypeScript'
      }
    }
  ];

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hudson Digital Solutions Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Expert insights on web development, React, TypeScript, and modern software engineering practices</description>
    <language>en-us</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/api/rss/feed" rel="self" type="application/rss+xml"/>
    <managingEditor>hello@hudsondigitalsolutions.com (Hudson Digital Solutions)</managingEditor>
    <webMaster>hello@hudsondigitalsolutions.com (Hudson Digital Solutions)</webMaster>
    <category>Technology</category>
    <category>Web Development</category>
    <category>Programming</category>
    <image>
      <url>${baseUrl}/HDS-Logo.jpeg</url>
      <title>Hudson Digital Solutions</title>
      <link>${baseUrl}/blog</link>
      <width>144</width>
      <height>144</height>
    </image>
${posts.map(post => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt}]]></description>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
      <author>hello@hudsondigitalsolutions.com (${post.primary_author.name})</author>
      <category><![CDATA[${post.primary_tag.name}]]></category>
    </item>`).join('\n')}
  </channel>
</rss>`;

  return rss;
}