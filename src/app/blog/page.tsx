import { Metadata } from "next";
import { getPosts, getFeaturedPosts, getTags } from "@/lib/ghost";
import Image from "next/image";
import Link from "next/link";
import { CalendarDaysIcon, ClockIcon, TagIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { formatDate } from "@/lib/ghost";

export const metadata: Metadata = {
  title: "Blog - Hudson Digital Solutions | Web Development Insights & Tutorials",
  description: "Latest web development insights, tutorials, and industry trends from Hudson Digital Solutions. Learn about React, Next.js, TypeScript, and modern web technologies.",
  keywords: "web development blog, React tutorials, Next.js guides, TypeScript tips, JavaScript insights, web development trends, Hudson Digital blog",
  openGraph: {
    title: "Blog - Hudson Digital Solutions",
    description: "Latest web development insights, tutorials, and industry trends",
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
  other: {
    "ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Hudson Digital Solutions Blog",
      "description": "Latest web development insights, tutorials, and industry trends",
      "url": "https://hudsondigitalsolutions.com/blog",
      "publisher": {
        "@type": "Organization",
        "name": "Hudson Digital Solutions",
        "logo": {
          "@type": "ImageObject",
          "url": "https://hudsondigitalsolutions.com/HDS-Logo.jpeg"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://hudsondigitalsolutions.com/blog"
      }
    })
  }
};

export default async function BlogPage() {
  const { posts, meta } = await getPosts(12);
  const featuredPosts = await getFeaturedPosts(3);
  const tags = await getTags();

  return (
    <main className="min-h-screen bg-gradient-primary">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-cyan-300 bg-cyan-400/10 text-cyan-400 font-semibold text-lg">
            <span className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"></span>
            Latest Insights
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-6">
            Web Development <span className="text-gradient-neon glow-cyan">Blog</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Stay ahead with the latest web development trends, tutorials, and insights from the trenches of modern software engineering.
          </p>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-gradient-primary">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-white mb-4">Featured Articles</h2>
              <p className="text-gray-300">Hand-picked insights that will level up your development skills</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <article key={post.id} className="group relative">
                  <div className="glass-morphism bg-black/80 border border-cyan-200 rounded-xl overflow-hidden hover:border-cyan-300 transition-all duration-300 hover:scale-105">
                    {post.feature_image && (
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={post.feature_image}
                          alt={post.feature_image_alt || post.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-cyan-400 text-black text-xs font-bold rounded-full">
                            FEATURED
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <CalendarDaysIcon className="w-4 h-4" />
                          {formatDate(post.published_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {post.reading_time || 5} min read
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-300 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span key={tag.id} className="flex items-center gap-1 text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">
                              <TagIcon className="w-3 h-3" />
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        Read More
                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                <p className="text-gray-300">Explore our complete collection of web development insights</p>
              </div>

              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No posts available yet.</p>
                  <p className="text-gray-500 mt-2">Check back soon for fresh content!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {posts.map((post) => (
                    <article key={post.id} className="group">
                      <div className="glass-morphism bg-black/80 border border-gray-700 rounded-xl p-6 hover:border-cyan-300 transition-all duration-300">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {post.feature_image && (
                            <div className="relative w-full lg:w-64 h-48 flex-shrink-0 overflow-hidden rounded-lg">
                              <Image
                                src={post.feature_image}
                                alt={post.feature_image_alt || post.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                              <span className="flex items-center gap-1">
                                <CalendarDaysIcon className="w-4 h-4" />
                                {formatDate(post.published_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                {post.reading_time || 5} min read
                              </span>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                              <Link href={`/blog/${post.slug}`}>
                                {post.title}
                              </Link>
                            </h3>
                            
                            <p className="text-gray-300 mb-4 line-clamp-2">
                              {post.excerpt}
                            </p>
                            
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {post.tags.slice(0, 4).map((tag) => (
                                  <span key={tag.id} className="flex items-center gap-1 text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">
                                    <TagIcon className="w-3 h-3" />
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            <Link
                              href={`/blog/${post.slug}`}
                              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold"
                            >
                              Read Full Article
                              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {meta.pagination.pages > 1 && (
                <div className="mt-12 flex justify-center gap-4">
                  {meta.pagination.prev && (
                    <Link
                      href={`/blog?page=${meta.pagination.prev}`}
                      className="px-4 py-2 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-500 transition-colors"
                    >
                      Previous
                    </Link>
                  )}
                  
                  <span className="px-4 py-2 text-gray-300">
                    Page {meta.pagination.page} of {meta.pagination.pages}
                  </span>
                  
                  {meta.pagination.next && (
                    <Link
                      href={`/blog?page=${meta.pagination.next}`}
                      className="px-4 py-2 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-500 transition-colors"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 space-y-8">
              {/* Newsletter Signup */}
              <div className="glass-morphism bg-black/80 border border-cyan-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Stay Updated</h3>
                <p className="text-gray-300 mb-4">Get the latest web development insights delivered to your inbox.</p>
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
                <p className="text-xs text-gray-500 mt-2">No spam, unsubscribe anytime.</p>
              </div>

              {/* Popular Tags */}
              {tags.length > 0 && (
                <div className="glass-morphism bg-black/80 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Popular Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 10).map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/blog/tag/${tag.slug}`}
                        className="text-sm text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 px-3 py-1 rounded-full transition-colors"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="glass-morphism bg-black/80 border border-green-200 rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-4">Need Help with Your Project?</h3>
                <p className="text-gray-300 mb-4">Let&apos;s discuss how I can help you build something amazing.</p>
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