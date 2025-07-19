import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon, TagIcon } from '@heroicons/react/24/outline';

// Mock data - replace with Ghost CMS integration
const MOCK_POSTS = [
  {
    id: '1',
    title: 'Building Scalable React Applications',
    excerpt: 'Learn the best practices for building large-scale React applications that perform well and are maintainable.',
    slug: 'building-scalable-react-applications',
    published_at: '2024-01-15',
    tags: ['react', 'javascript', 'web-development'],
    reading_time: 8
  },
  {
    id: '2',
    title: 'Next.js 15: What&apos;s New and Improved',
    excerpt: 'Explore the latest features and improvements in Next.js 15, including performance enhancements and new APIs.',
    slug: 'nextjs-15-whats-new',
    published_at: '2024-01-10',
    tags: ['nextjs', 'react', 'web-development'],
    reading_time: 6
  },
  {
    id: '3',
    title: 'TypeScript Best Practices for 2024',
    excerpt: 'Modern TypeScript patterns and practices that will make your code more robust and maintainable.',
    slug: 'typescript-best-practices-2024',
    published_at: '2024-01-05',
    tags: ['typescript', 'javascript', 'best-practices'],
    reading_time: 10
  }
];

const COMMON_TAGS = [
  'react', 'nextjs', 'typescript', 'javascript', 'web-development', 
  'best-practices', 'performance', 'seo', 'ui-ux', 'backend'
];

interface BlogTagPageProps {
  params: Promise<{
    tag: string;
  }>;
}

export async function generateStaticParams() {
  return COMMON_TAGS.map((tag) => ({
    tag: tag,
  }));
}

export async function generateMetadata({ params }: BlogTagPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const tag = decodeURIComponent(resolvedParams.tag);
  const tagTitle = tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  return {
    title: `${tagTitle} Articles - Hudson Digital Solutions Blog`,
    description: `Explore articles about ${tagTitle.toLowerCase()} from Hudson Digital Solutions. Expert insights on web development, technology, and digital solutions.`,
    openGraph: {
      title: `${tagTitle} Articles - Hudson Digital Solutions Blog`,
      description: `Explore articles about ${tagTitle.toLowerCase()} from Hudson Digital Solutions.`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${tagTitle} Articles - Hudson Digital Solutions Blog`,
      description: `Explore articles about ${tagTitle.toLowerCase()} from Hudson Digital Solutions.`,
    }
  };
}

export default async function BlogTagPage({ params }: BlogTagPageProps) {
  const resolvedParams = await params;
  const tag = decodeURIComponent(resolvedParams.tag);
  const tagTitle = tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  // Filter posts by tag
  const tagPosts = MOCK_POSTS.filter(post => 
    post.tags.some(postTag => postTag.toLowerCase() === tag.toLowerCase())
  );

  if (tagPosts.length === 0) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-hero">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Blog
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <TagIcon className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl md:text-5xl font-black text-white">
              {tagTitle}
            </h1>
          </div>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {tagPosts.length} article{tagPosts.length !== 1 ? 's' : ''} tagged with &quot;{tagTitle.toLowerCase()}&quot;
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {tagPosts.map((post) => (
            <article 
              key={post.id}
              className="glass-light rounded-xl p-6 hover:glow-cyan transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 2).map((postTag) => (
                    <Link
                      key={postTag}
                      href={`/blog/tag/${postTag}`}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        postTag.toLowerCase() === tag.toLowerCase()
                          ? 'bg-cyan-400 text-black'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {postTag}
                    </Link>
                  ))}
                </div>
                <span className="text-xs text-gray-400">{post.reading_time} min read</span>
              </div>
              
              <h2 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                <Link href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>
              
              <p className="text-gray-300 mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between">
                <time className="text-sm text-gray-400">
                  {new Date(post.published_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
                
                <Link 
                  href={`/blog/${post.slug}`}
                  className="text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors"
                >
                  Read More →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Related Tags */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-6">Explore More Topics</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {COMMON_TAGS.filter(t => t !== tag).slice(0, 8).map((relatedTag) => (
              <Link
                key={relatedTag}
                href={`/blog/tag/${relatedTag}`}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full hover:bg-cyan-400 hover:text-black transition-colors text-sm font-medium"
              >
                {relatedTag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}