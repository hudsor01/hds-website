import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";
import { getPostBySlug, getPostsByTag, getPosts } from "@/lib/blog";
import { BlogPostContent } from "@/components/blog/BlogPostContent";
import { AuthorCard } from "@/components/blog/AuthorCard";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { JsonLd } from "@/components/utilities/JsonLd";
import { BUSINESS_INFO } from "@/lib/constants/business";
import { formatDate } from "@/lib/utils";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

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
    title: `${post.title} - Hudson Digital Solutions`,
    description: post.excerpt,
    keywords: post.tags?.map((tag) => tag.name)?.join(", "),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.feature_image ? [
        {
          url: post.feature_image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ] : [],
      type: "article",
      publishedTime: post.published_at,
      authors: [post.author.name],
      tags: post.tags?.map((tag) => tag.name),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.feature_image ? [post.feature_image] : [],
    },
    alternates: {
      canonical: `https://hudsondigitalsolutions.com/blog/${post.slug}`,
    },
  };
}

export async function generateStaticParams() {
  try {
    const { posts } = await getPosts();
    const results = posts.map((post) => ({
      slug: post.slug,
    }));

    if (results.length === 0) {
      return [{ slug: '__placeholder__' }];
    }

    return results;
  } catch {
    // Tables may not exist yet during initial deployment
    return [{ slug: '__placeholder__' }];
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const tags = post.tags || [];
  const primaryTag = tags[0];

  let relatedPosts: Awaited<ReturnType<typeof getPostsByTag>> = [];
  if (primaryTag) {
    const related = await getPostsByTag(primaryTag.slug);
    relatedPosts = related.filter((p) => p.id !== post.id).slice(0, 3);
  }

  const canonicalUrl = `https://hudsondigitalsolutions.com/blog/${post.slug}`;

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    image: post.feature_image ?? undefined,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: BUSINESS_INFO.name,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://hudsondigitalsolutions.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://hudsondigitalsolutions.com/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-background">
      <JsonLd data={blogPostingSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* Back to Blog */}
      <div className="container-wide py-8">
        <Link
          href="/blog"
          className="inline-flex flex-center gap-tight text-accent hover:text-accent/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Blog
        </Link>
      </div>

      {/* Article Header */}
      <article className="pb-16">
        <header className="relative bg-background py-section-sm overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 surface-overlay"></div>
          </div>

          <div className="relative container-narrow">
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-tight mb-content-block">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog/tag/${tag.slug}`}
                    className="flex flex-center gap-1 text-sm text-accent bg-accent/10 hover:bg-accent/20 px-3 py-1 rounded-full transition-colors"
                  >
                    <Tag className="w-4 h-4" />
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-clamp-xl font-black text-foreground mb-content-block text-balance">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-muted-foreground mb-comfortable text-pretty">
                {post.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-comfortable text-muted-foreground">
              <div className="flex flex-center gap-tight">
                <Calendar className="w-5 h-5" />
                <time dateTime={post.published_at}>
                  {formatDate(post.published_at, 'long')}
                </time>
              </div>
              <div className="flex flex-center gap-tight">
                <Clock className="w-5 h-5" />
                <span>{post.reading_time} min read</span>
              </div>
              {post.author && (
                <div className="flex flex-center gap-tight">
                  {post.author.profile_image && (
                    <Image
                      src={post.author.profile_image}
                      alt={post.author.name}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  <span>By {post.author.name}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Feature Image */}
        {post.feature_image && (
          <div className="container-wide py-8">
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={post.feature_image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="container-narrow py-8">
          <BlogPostContent post={post} />
        </div>

        {/* Author Bio */}
        {post.author && (
          <div className="container-narrow py-8">
            <AuthorCard author={post.author} />
          </div>
        )}
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <RelatedPosts posts={relatedPosts} />
      )}

      {/* CTA Section */}
      <section className="py-section-sm bg-primary">
        <div className="container-narrow">
          <Card variant="glass" size="lg" className="text-center">
            <h2 className="text-3xl font-black text-foreground mb-heading text-balance">
              Ready to Build Your Competitive Advantage?
            </h2>
            <p className="text-xl text-muted-foreground mb-comfortable text-pretty">
              Let&apos;s engineer a digital solution that dominates your market.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-success-text text-black font-semibold py-3 px-8 rounded-lg hover:bg-success transition-colors text-lg"
            >
              Get Started Today
            </Link>
          </Card>
        </div>
      </section>
    </main>
  );
}
