import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { AnimatedCard } from '@/components/animated/animated-card';
import { AnimatedText } from '@/components/animated/animated-text';
import { getBlogPosts } from '@/lib/data-fetchers';

export const metadata: Metadata = {
  title: 'Blog | Hudson Digital Solutions - Revenue Operations Insights',
  description:
    'Learn from my 10 years of revenue operations experience at Thryv. Tips, guides, and insights for small businesses.',
  keywords:
    'revenue operations blog, sales automation tips, small business growth, Dallas Fort Worth',
};

// Fallback blog posts for when database is not available
const fallbackBlogPosts = [
  {
    id: 'small-business-revenue-operations',
    title: '5 Revenue Operations Strategies Every Small Business Needs',
    excerpt: 'Learn the essential RevOps strategies I implemented at Thryv that small businesses can use to grow revenue predictably.',
    publishedAt: '2024-01-15',
    readTime: '5 min read',
    href: '/blog/small-business-revenue-operations',
    image: '/images/blog/revops-strategies.jpg',
  },
  {
    id: 'salesforce-deduplication-guide',
    title: 'The Complete Guide to Salesforce Deduplication',
    excerpt: 'Step-by-step process I used at Spotio to clean up 15,000+ duplicate records in Salesforce.',
    publishedAt: '2024-01-10',
    readTime: '8 min read',
    href: '/blog/salesforce-deduplication-guide',
    image: '/images/blog/salesforce-guide.jpg',
  },
  {
    id: 'automate-sales-process',
    title: 'How to Automate Your Sales Process Without Breaking the Bank',
    excerpt: 'Practical automation tips for small businesses using affordable tools like HubSpot and Zapier.',
    publishedAt: '2024-01-05',
    readTime: '6 min read',
    href: '/blog/automate-sales-process',
    image: '/images/blog/sales-automation.jpg',
  },
  {
    id: 'data-driven-decisions',
    title: 'Making Data-Driven Decisions in Small Business',
    excerpt: 'How to set up dashboards and reports that actually help you make better business decisions.',
    publishedAt: '2023-12-20',
    readTime: '7 min read',
    href: '/blog/data-driven-decisions',
    image: '/images/blog/data-decisions.jpg',
  },
];

// Server Component - Fetch data from database
export default async function BlogPage() {
  // Fetch blog posts from database
  const dbBlogPosts = await getBlogPosts();
  
  // Use database posts if available, otherwise use fallback
  const blogPosts = dbBlogPosts.length > 0 ? dbBlogPosts : fallbackBlogPosts;
  return (
    <main className="py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <AnimatedText
            as="h1"
            text="Blog & Insights"
            className="text-4xl font-bold tracking-tight text-white sm:text-6xl"
            delay={0}
          />
          <AnimatedText
            as="p"
            text="10 years of revenue operations experience distilled into actionable
            insights for small businesses."
            className="mt-6 text-lg leading-8 text-gray-300"
            delay={0.2}
          />
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {blogPosts.map((post, index) => (
            <AnimatedCard
              key={post.id}
              delay={0.4 + index * 0.1}
              className="flex flex-col bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex items-center gap-x-4 text-xs">
                <span className="text-blue-400">Blog Post</span>
                <time
                  dateTime={post.publishedAt}
                  className="text-gray-500 flex items-center"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
              </div>
              <div className="group relative flex-1">
                <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
                  <Link href={post.href}>
                    <span className="absolute inset-0" />
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-5 text-sm leading-6 text-gray-300">
                  {post.excerpt}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  {post.readTime}
                </div>
                <Link
                  href={post.href}
                  className="flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </AnimatedCard>
          ))}
        </div>

        <AnimatedCard
          delay={0.8}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold text-white">Want to Learn More?</h2>
          <p className="mt-4 text-lg text-gray-300">
            Subscribe to my newsletter for weekly revenue operations tips and
            insights.
          </p>
          <form className="mt-6 flex max-w-md mx-auto gap-x-4">
            <input
              type="email"
              required
              className="min-w-0 flex-auto rounded-md border-0 bg-gray-700 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
              placeholder="Enter your email"
            />
            <button
              type="submit"
              className="flex-none rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </AnimatedCard>
      </div>
    </main>
  );
}