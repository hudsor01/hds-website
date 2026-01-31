import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { getPosts, getFeaturedPosts, getTags } from "@/lib/blog";
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

// Static blog data - no revalidation needed
// For dynamic content, use React cache() at data layer + revalidate here

export default async function BlogPage() {
  const [featuredPosts, allPostsResult, tags] = await Promise.all([
    getFeaturedPosts(3),
    getPosts({ limit: 10 }),
    getTags(),
  ]);

  const allPosts = allPostsResult.posts;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-background section-spacing overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 surface-overlay"></div>
          <div className="absolute inset-0 grid-pattern-subtle"></div>
        </div>

        <div className="relative container-wide text-center">
          <div className="inline-flex flex-center gap-tight px-4 py-2 mb-comfortable rounded-full border border-accent/60 bg-accent/10 text-accent font-semibold text-body-lg">
            <span className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"></span>
            Strategic Insights
          </div>
          <h1 className="text-clamp-xl font-black text-foreground mb-heading text-balance">
            Business <span className="text-accent">Strategy</span> Blog
          </h1>
          <p className="text-subheading text-muted container-narrow text-pretty">
            Strategic insights on web development, business growth, and digital dominance. Learn how to engineer competitive advantages through technology.
          </p>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="section-spacing bg-primary">
          <div className="container-wide">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-foreground mb-heading text-balance">Featured Articles</h2>
              <p className="text-muted text-pretty">Essential reading for ambitious business owners</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-sections">
              {featuredPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="section-spacing bg-primary">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row gap-comfortable">
            {/* Main Content */}
            <div className="flex-1">
              <div className="text-center lg:text-left mb-content-block">
                <h2 className="text-section-title font-black text-foreground mb-subheading text-balance">All Articles</h2>
                <p className="text-muted text-pretty">Strategic insights for business growth and digital dominance</p>
              </div>

              {allPosts.length === 0 ? (
                <Card variant="glass" size="lg" className="text-center">
                  <p className="text-muted text-lg">No articles found. Check back soon for new content!</p>
                </Card>
              ) : (
                <div className="space-y-sections">
                  {allPosts.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 space-y-sections">
              {/* Newsletter Signup */}
              <Card variant="glass" >
                <h3 className="text-xl font-bold text-foreground mb-heading text-balance">Stay Updated</h3>
                <p className="text-muted mb-heading text-pretty">Get strategic insights delivered to your inbox.</p>
                <Link
                  href="/contact"
                  className="inline-block w-full text-center bg-accent text-black font-semibold py-2 px-6 rounded-lg hover:bg-primary/80 transition-colors"
                >
                  Contact Us to Subscribe
                </Link>
                <p className="text-xs text-muted-foreground mt-2">Strategic insights, no spam.</p>
              </Card>

              {/* Topics */}
              {tags.length > 0 && <TagList tags={tags} />}

              {/* CTA */}
              <Card variant="glass" size="sm" className="text-center">
                <h3 className="text-subheading font-bold text-foreground mb-subheading text-balance">Ready to Dominate Your Market?</h3>
                <p className="text-muted mb-subheading text-pretty">Let&apos;s engineer your competitive advantage.</p>
                <Link
                  href="/contact"
                  className="inline-block bg-success-text text-black font-semibold p-button rounded-lg hover:bg-success transition-colors"
                >
                  Get Started
                </Link>
              </Card>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
