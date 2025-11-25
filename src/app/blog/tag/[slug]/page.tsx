import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
import { getPostsByTag, getTagBySlug, getTags } from "@/lib/ghost";
import { BlogPostCard } from "@/components/blog/BlogPostCard";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

// Next.js 16: Using cacheLife instead
// export const revalidate = 60;

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);

  if (!tag) {
    return {
      title: "Tag Not Found - Hudson Digital Solutions",
      description: "The requested tag could not be found.",
    };
  }

  return {
    title: `${tag.name} - Blog Tags - Hudson Digital Solutions`,
    description: tag.meta_description || tag.description || `Articles tagged with ${tag.name}`,
    openGraph: {
      title: `${tag.name} - Hudson Digital Solutions`,
      description: tag.meta_description || tag.description || `Articles tagged with ${tag.name}`,
      images: tag.feature_image ? [
        {
          url: tag.feature_image,
          width: 1200,
          height: 630,
          alt: tag.name,
        },
      ] : [],
    },
    alternates: {
      canonical: `https://hudsondigitalsolutions.com/blog/tag/${tag.slug}`,
    },
  };
}

export async function generateStaticParams() {
  const tags = await getTags();
  const results = tags.map((tag) => ({
    slug: tag.slug,
  }));

  // Next.js 16: cacheComponents requires at least one static param
  if (results.length === 0) {
    return [{ slug: '__placeholder__' }];
  }

  return results;
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const [tag, postsResult] = await Promise.all([
    getTagBySlug(slug),
    getPostsByTag(slug, { limit: 20 }),
  ]);

  if (!tag) {
    notFound();
  }

  const posts = postsResult.posts;

  return (
    <main className="min-h-screen bg-gradient-primary">
      {/* Back to Blog */}
      <div className="container-wide py-8">
        <Link
          href="/blog"
          className="inline-flex flex-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Blog
        </Link>
      </div>

      {/* Tag Header */}
      <section className="relative bg-gradient-hero py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 grid-pattern-subtle"></div>
        </div>

        <div className="relative container-wide text-center">
          <div className="inline-flex flex-center gap-2 px-4 py-2 mb-8 rounded-full border border-cyan-300 bg-cyan-400/10 text-cyan-400 font-semibold text-lg">
            <Tag className="w-5 h-5" />
            Tag
          </div>
          <h1 className="text-clamp-xl font-black text-white mb-6 text-balance">
            {tag.name}
          </h1>
          {tag.description && (
            <p className="text-xl text-muted container-narrow text-pretty">
              {tag.description}
            </p>
          )}
          <p className="text-muted-foreground mt-4">
            {posts.length} {posts.length === 1 ? "article" : "articles"}
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-16 bg-gradient-primary">
        <div className="container-wide">
          {posts.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-muted text-lg">No articles found for this tag.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
