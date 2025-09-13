import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDaysIcon, ClockIcon, TagIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Blog - Hudson Digital Solutions | Web Development Insights & Business Strategy",
  description: "Strategic insights on web development, business growth, and digital dominance from Hudson Digital Solutions. Learn how to engineer competitive advantages through technology.",
  keywords: "web development blog, business strategy, digital marketing, competitive advantage, web performance, Hudson Digital Solutions",
  openGraph: {
    title: "Blog - Hudson Digital Solutions",
    description: "Strategic insights on web development, business growth, and digital dominance",
    url: "https://hudsondigitalsolutions.com/blog",
    images: [
      {
        url: "/HDS-Logo.jpeg",
        width: 1200,
        height: 630,
        alt: "Hudson Digital Solutions Blog",
      },
    ],
  },
  alternates: {
    canonical: "https://hudsondigitalsolutions.com/blog",
  },
};

// Blog posts data - add more posts here as you create them
const blogPosts = [
  {
    id: "1",
    title: "Beyond 'Just Works': Why Businesses Need Websites That Dominate",
    slug: "beyond-just-works-why-businesses-need-websites-that-dominate",
    excerpt: "The brutal truth about why most business websites fail to deliver results—and what ambitious companies do differently. Discover why 'good enough' websites cost you revenue and how digital dominance creates competitive advantages.",
    publishedAt: "2024-01-31",
    readingTime: 12,
    featured: true,
    tags: ["Business Strategy", "Web Development", "Digital Marketing"],
    author: "Hudson Digital Solutions"
  },
  {
    id: "2",
    title: "How to Increase Website Conversion Rates: 2025 Complete Guide",
    slug: "how-to-increase-website-conversion-rates-2025-guide",
    excerpt: "15 proven strategies to boost your website conversion rates by 300%+. From UX optimization to psychology-based design, real case studies and actionable tactics that drive results.",
    publishedAt: "2024-02-15",
    readingTime: 15,
    featured: true,
    tags: ["Conversion Optimization", "UX Design", "Web Performance"],
    author: "Hudson Digital Solutions"
  },
  {
    id: "3",
    title: "Small Business Website Cost 2025: Complete Pricing Guide",
    slug: "small-business-website-cost-2025",
    excerpt: "Complete breakdown of website costs for small businesses in 2025. Compare DIY vs professional options, ROI analysis, hidden costs, and how to choose the right investment level for your business growth.",
    publishedAt: "2024-03-01",
    readingTime: 14,
    featured: false,
    tags: ["Small Business", "Web Development", "Pricing", "ROI"],
    author: "Hudson Digital Solutions"
  }
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured);
  const allPosts = blogPosts;

  return (
    <main className="min-h-screen bg-gradient-primary">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-size-[80px_80px]"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-cyan-300 bg-cyan-400/10 text-cyan-400 font-semibold text-lg">
            <span className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"></span>
            Strategic Insights
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-6">
            Business <span className="text-gradient-neon glow-cyan">Strategy</span> Blog
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Strategic insights on web development, business growth, and digital dominance. Learn how to engineer competitive advantages through technology.
          </p>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-gradient-primary">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-white mb-4">Featured Article</h2>
              <p className="text-gray-300">Essential reading for ambitious business owners</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <article key={post.id} className="group relative lg:col-span-2">
                  <div className="glass-morphism bg-black/80 border border-cyan-200 rounded-xl overflow-hidden hover:border-cyan-300 transition-all duration-300 hover:scale-105">
                    
                    <div className="p-8">
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <span className="flex items-center gap-1">
                          <CalendarDaysIcon className="w-4 h-4" />
                          {formatDate(post.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {post.readingTime} min read
                        </span>
                        <span className="px-3 py-1 bg-cyan-400 text-black text-xs font-bold rounded-full">
                          FEATURED
                        </span>
                      </div>
                      
                      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {post.tags.map((tag) => (
                          <span key={tag} className="flex items-center gap-1 text-xs text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full">
                            <TagIcon className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold text-lg"
                      >
                        Read Full Article
                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-16 bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              <div className="text-center lg:text-left mb-12">
                <h2 className="text-3xl font-black text-white mb-4">All Articles</h2>
                <p className="text-gray-300">Strategic insights for business growth and digital dominance</p>
              </div>

              <div className="space-y-8">
                {allPosts.map((post) => (
                  <article key={post.id} className="group">
                    <div className="glass-morphism bg-black/80 border border-gray-700 rounded-xl p-6 hover:border-cyan-300 transition-all duration-300">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <CalendarDaysIcon className="w-4 h-4" />
                            {formatDate(post.publishedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {post.readingTime} min read
                          </span>
                          <span className="text-gray-500">By {post.author}</span>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                          <Link href={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h3>
                        
                        <p className="text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag) => (
                            <span key={tag} className="flex items-center gap-1 text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">
                              <TagIcon className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <Link
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          Read Full Article
                          <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 space-y-8">
              {/* Newsletter Signup */}
              <div className="glass-morphism bg-black/80 border border-cyan-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Stay Updated</h3>
                <p className="text-gray-300 mb-4">Get strategic insights delivered to your inbox.</p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                  />
                  <button className="w-full bg-cyan-400 text-black font-semibold py-2 rounded-lg hover:bg-cyan-500 transition-colors">
                    Subscribe
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Strategic insights, no spam.</p>
              </div>

              {/* Topics */}
              <div className="glass-morphism bg-black/80 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {["Business Strategy", "Web Development", "Digital Marketing", "Conversion Optimization", "Small Business", "ROI", "UX Design", "Competitive Advantage"].map((topic) => (
                    <span
                      key={topic}
                      className="text-sm text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 px-3 py-1 rounded-full transition-colors cursor-pointer"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="glass-morphism bg-black/80 border border-green-200 rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-4">Ready to Dominate Your Market?</h3>
                <p className="text-gray-300 mb-4">Let&apos;s engineer your competitive advantage.</p>
                <Link
                  href="/contact"
                  className="inline-block bg-green-400 text-black font-semibold py-2 px-6 rounded-lg hover:bg-green-500 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}