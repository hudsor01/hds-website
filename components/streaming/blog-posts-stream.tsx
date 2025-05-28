import { Suspense } from 'react'
import { getBlogPosts, preloadBlogPosts } from '@/lib/data-fetchers'
import { BlogPostsSkeleton } from './blog-posts-skeleton'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface BlogPostsStreamProps {
  limit?: number
}

// Server Component that fetches data
async function BlogPostsContent({ limit }: { limit?: number }) {
  // Data is cached and will be reused if called multiple times
  const posts = await getBlogPosts(limit)

  return (
    <div className='grid gap-6 md:grid-cols-2'>
      {posts.map((post) => (
        <Card key={post.id} className='hover:shadow-lg transition-shadow'>
          <CardHeader>
            <div className='flex items-center gap-2 text-sm text-muted-foreground mb-2'>
              <span>{post.author}</span>
              <span>•</span>
              <span>{post.publishedAt}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
            <CardTitle>
              <Link href={post.href} className='hover:text-primary transition-colors'>
                {post.title}
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className='text-base'>
              {post.excerpt}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Main component that implements streaming
export function BlogPostsStream({ limit }: BlogPostsStreamProps) {
  // Preload data for better performance
  preloadBlogPosts(limit)

  return (
    <div>
      <div className='text-center mb-12'>
        <h2 className='text-3xl font-bold tracking-tight mb-4'>Latest Blog Posts</h2>
        <p className='text-muted-foreground max-w-2xl mx-auto'>
          Stay updated with the latest insights on revenue operations, web development, 
          and business growth strategies.
        </p>
      </div>

      {/* Suspense boundary for streaming */}
      <Suspense fallback={<BlogPostsSkeleton />}>
        <BlogPostsContent limit={limit} />
      </Suspense>
    </div>
  )
}