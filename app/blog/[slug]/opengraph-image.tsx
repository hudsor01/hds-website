import { ImageResponse } from 'next/og'
import { cache } from 'react'

// Image metadata
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Cached function to get blog post data
const getBlogPost = cache(async (slug: string) => {
  // In a real app, this would fetch from your CMS or database
  // For demo purposes, we'll return mock data based on slug
  const mockPosts: Record<string, unknown> = {
    'revenue-operations-guide': {
      title: 'Complete Guide to Revenue Operations',
      description: 'Master the fundamentals of RevOps',
      category: 'Revenue Operations',
      readTime: '12 min read',
      author: 'Hudson Digital Team',
    },
    'data-driven-growth': {
      title: 'Data-Driven Growth Strategies',
      description: 'Use analytics to fuel business growth',
      category: 'Data Analytics',
      readTime: '8 min read',
      author: 'Data Team',
    },
    'web-performance-optimization': {
      title: 'Web Performance Optimization',
      description: 'Speed up your website for better conversions',
      category: 'Web Development',
      readTime: '15 min read',
      author: 'Dev Team',
    },
  }

  return mockPosts[slug] || {
    title: 'Blog Post',
    description: 'Insights and strategies for business growth',
    category: 'Business',
    readTime: '5 min read',
    author: 'Hudson Digital',
  }
})

// Dynamic OG image generation for blog posts
export default async function BlogOGImage({ 
  params, 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  // Category color mapping
  const categoryColors: Record<string, string> = {
    'Revenue Operations': '#10B981',
    'Data Analytics': '#8B5CF6',
    'Web Development': '#3B82F6',
    'Business': '#F59E0B',
  }

  const categoryColor = categoryColors[post.category] || '#6B7280'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
          fontFamily: 'Inter, sans-serif',
          padding: '60px',
        }}
      >
        {/* Header with Logo and Category */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: '40px',
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'white',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1F2937',
                }}
              >
                H
              </div>
            </div>
            <div
              style={{
                color: 'white',
                fontSize: '20px',
                fontWeight: '600',
              }}
            >
              Hudson Digital
            </div>
          </div>

          {/* Category Badge */}
          <div
            style={{
              backgroundColor: categoryColor,
              color: 'white',
              padding: '8px 20px',
              borderRadius: '24px',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            {post.category}
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            width: '100%',
          }}
        >
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: 'white',
              lineHeight: '1.1',
              marginBottom: '24px',
              maxWidth: '900px',
            }}
          >
            {post.title}
          </h1>
          
          <p
            style={{
              fontSize: '28px',
              color: 'rgba(255,255,255,0.8)',
              fontWeight: '400',
              lineHeight: '1.4',
              maxWidth: '800px',
              marginBottom: '32px',
            }}
          >
            {post.description}
          </p>
        </div>

        {/* Footer with Author and Read Time */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '40px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: categoryColor,
                borderRadius: '50%',
                marginRight: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold',
                }}
              >
                {post.author.charAt(0)}
              </div>
            </div>
            <div
              style={{
                color: 'white',
                fontSize: '18px',
                fontWeight: '500',
              }}
            >
              {post.author}
            </div>
          </div>

          <div
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '18px',
              fontWeight: '400',
            }}
          >
            {post.readTime}
          </div>
        </div>

        {/* Decorative Elements */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            right: '5%',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '15%',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: `${categoryColor}20`,
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  )
}