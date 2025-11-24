import type { Metadata } from "next";
import Link from "next/link";
import { getPosts, getFeaturedPosts, getTags } from "@/lib/ghost";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { TagList } from "@/components/blog/TagList";

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

export const revalidate = 60;

export default async function BlogPage() {
  const [featuredPosts, allPostsResult, tags] = await Promise.all([
    getFeaturedPosts(3),
    getPosts({ limit: 10 }),
    getTags(),
  ]);

  const allPosts = allPostsResult.posts;

  return (
    <main className="min-h-screen bg-gradient-primary">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 grid-pattern-subtle"></div>
        </div>

        <div className="relative container-wide text-center">
          <div className="inline-flex flex-center gap-2 px-4 py-2 mb-8 rounded-full border border-cyan-300 bg-cyan-400/10 text-cyan-400 font-semibold text-lg">
            <span className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"></span>
            Strategic Insights
          </div>
          <h1 className="text-clamp-xl font-black text-white mb-6 text-balance">
            Business <span className="gradient-text">Strategy</span> Blog
          </h1>
          <p className="text-xl text-gray-300 container-narrow text-pretty">
            Strategic insights on web development, business growth, and digital dominance. Learn how to engineer competitive advantages through technology.
          </p>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-gradient-primary">
          <div className="container-wide">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-white mb-4 text-balance">Featured Articles</h2>
              <p className="text-gray-300 text-pretty">Essential reading for ambitious business owners</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-16 bg-gradient-primary">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              <div className="text-center lg:text-left mb-12">
                <h2 className="text-3xl font-black text-white mb-4 text-balance">All Articles</h2>
                <p className="text-gray-300 text-pretty">Strategic insights for business growth and digital dominance</p>
              </div>

              {allPosts.length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center">
                  <p className="text-gray-300 text-lg">No articles found. Check back soon for new content!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {allPosts.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 space-y-8">
              {/* Newsletter Signup - TODO: Implement Ghost newsletter integration */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 text-balance">Stay Updated</h3>
                <p className="text-gray-300 mb-4 text-pretty">Get strategic insights delivered to your inbox.</p>
                <Link
                  href="/contact"
                  className="inline-block w-full text-center bg-cyan-400 text-black font-semibold py-2 px-6 rounded-lg hover:bg-cyan-500 transition-colors"
                >
                  Contact Us to Subscribe
                </Link>
                <p className="text-xs text-gray-500 mt-2">Strategic insights, no spam.</p>
              </div>

              {/* Topics */}
              {tags.length > 0 && <TagList tags={tags} />}

              {/* CTA */}
              <div className="glass-card rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-4 text-balance">Ready to Dominate Your Market?</h3>
                <p className="text-gray-300 mb-4 text-pretty">Let&apos;s engineer your competitive advantage.</p>
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
