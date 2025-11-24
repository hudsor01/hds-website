import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";
import { getPostBySlug, getPosts, getPostsByTag } from "@/lib/ghost";
import { BlogPostContent } from "@/components/blog/BlogPostContent";
import { AuthorCard } from "@/components/blog/AuthorCard";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { formatDateLong } from "@/lib/utils";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found - Hudson Digital Solutions",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: post.meta_title || `${post.title} - Hudson Digital Solutions`,
    description: post.meta_description || post.excerpt || post.custom_excerpt,
    keywords: post.tags?.map((tag) => tag.name)?.join(", "),
    openGraph: {
      title: post.og_title || post.title,
      description: post.og_description || post.excerpt || post.custom_excerpt,
      images: post.og_image || post.feature_image ? [
        {
          url: post.og_image || post.feature_image || "",
          width: 1200,
          height: 630,
          alt: post.feature_image_alt || post.title,
        },
      ] : [],
      type: "article",
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: post.authors?.map((author) => author.name),
      tags: post.tags?.map((tag) => tag.name),
    },
    twitter: {
      card: "summary_large_image",
      title: post.twitter_title || post.title,
      description: post.twitter_description || post.excerpt || post.custom_excerpt,
      images: post.twitter_image || post.feature_image ? [post.twitter_image || post.feature_image || ""] : [],
    },
    alternates: {
      canonical: `https://hudsondigitalsolutions.com/blog/${post.slug}`,
    },
  };
}

export async function generateStaticParams() {
  const result = await getPosts({ limit: 100 });
  const posts = result.posts;

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const primaryAuthor = post.primary_author || post.authors?.[0];
  const tags = post.tags || [];
  const primaryTag = post.primary_tag || tags[0];

  let relatedPosts: Awaited<ReturnType<typeof getPostsByTag>>['posts'] = [];
  if (primaryTag) {
    const relatedResult = await getPostsByTag(primaryTag.slug, { limit: 3 });
    relatedPosts = relatedResult.posts.filter((p) => p.id !== post.id).slice(0, 3);
  }

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

      {/* Article Header */}
      <article className="pb-16">
        <header className="relative bg-gradient-hero py-16 overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
          </div>

          <div className="relative container-narrow">
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog/tag/${tag.slug}`}
                    className="flex flex-center gap-1 text-sm text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 px-3 py-1 rounded-full transition-colors"
                  >
                    <Tag className="w-4 h-4" />
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-clamp-xl font-black text-white mb-6 text-balance">
              {post.title}
            </h1>

            {/* Excerpt */}
            {(post.custom_excerpt || post.excerpt) && (
              <p className="text-xl text-gray-300 mb-8 text-pretty">
                {post.custom_excerpt || post.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-6 text-gray-400">
              <div className="flex flex-center gap-2">
                <Calendar className="w-5 h-5" />
                <time dateTime={post.published_at}>
                  {formatDateLong(post.published_at)}
                </time>
              </div>
              <div className="flex flex-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{post.reading_time} min read</span>
              </div>
              {primaryAuthor && (
                <div className="flex flex-center gap-2">
                  {primaryAuthor.profile_image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={primaryAuthor.profile_image}
                      alt={primaryAuthor.name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span>By {primaryAuthor.name}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Feature Image */}
        {post.feature_image && (
          <div className="container-wide py-8">
            <div className="relative aspect-video rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.feature_image}
                alt={post.feature_image_alt || post.title}
                className="w-full h-full object-cover"
              />
              {post.feature_image_caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-sm text-gray-300">{post.feature_image_caption}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="container-narrow py-8">
          <BlogPostContent post={post} />
        </div>

        {/* Author Bio */}
        {primaryAuthor && (
          <div className="container-narrow py-8">
            <AuthorCard author={primaryAuthor} />
          </div>
        )}
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <RelatedPosts posts={relatedPosts} />
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary">
        <div className="container-narrow">
          <div className="glass-card rounded-xl p-8 text-center">
            <h2 className="text-3xl font-black text-white mb-4 text-balance">
              Ready to Build Your Competitive Advantage?
            </h2>
            <p className="text-xl text-gray-300 mb-8 text-pretty">
              Let&apos;s engineer a digital solution that dominates your market.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-green-400 text-black font-semibold py-3 px-8 rounded-lg hover:bg-green-500 transition-colors text-lg"
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
