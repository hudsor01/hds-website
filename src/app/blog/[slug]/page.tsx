import { Metadata } from "next";
import { getPost, getPosts } from "@/lib/ghost";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CalendarDaysIcon, ClockIcon, TagIcon, ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { formatDate } from "@/lib/ghost";

interface BlogPostProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  
  if (!post) {
    return {
      title: "Post Not Found - Hudson Digital Solutions",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: post.meta_title || `${post.title} - Hudson Digital Solutions Blog`,
    description: post.meta_description || post.excerpt,
    keywords: post.tags?.map(tag => tag.name).join(", "),
    openGraph: {
      title: post.og_title || post.title,
      description: post.og_description || post.excerpt,
      url: `https://hudsondigitalsolutions.com/blog/${post.slug}`,
      images: post.og_image || post.feature_image ? [
        {
          url: post.og_image || post.feature_image!,
          width: 1200,
          height: 630,
          alt: post.feature_image_alt || post.title,
        },
      ] : [],
      type: "article",
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: post.authors?.map(author => author.name),
      tags: post.tags?.map(tag => tag.name),
    },
    twitter: {
      card: "summary_large_image",
      title: post.twitter_title || post.title,
      description: post.twitter_description || post.excerpt,
      images: post.twitter_image || post.feature_image || undefined,
    },
    alternates: {
      canonical: post.canonical_url || `https://hudsondigitalsolutions.com/blog/${post.slug}`,
    },
    other: {
      "ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "image": post.feature_image || "",
        "author": {
          "@type": "Person",
          "name": post.authors?.[0]?.name || "Hudson Digital Solutions",
          "url": "https://hudsondigitalsolutions.com"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Hudson Digital Solutions",
          "logo": {
            "@type": "ImageObject",
            "url": "https://hudsondigitalsolutions.com/HDS-Logo.jpeg"
          }
        },
        "datePublished": post.published_at,
        "dateModified": post.updated_at,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://hudsondigitalsolutions.com/blog/${post.slug}`
        },
        "keywords": post.tags?.map(tag => tag.name).join(", "),
        "wordCount": post.html.replace(/<[^>]*>/g, '').split(/\s+/).length,
        "timeRequired": `PT${post.reading_time || 5}M`,
        "articleBody": post.html.replace(/<[^>]*>/g, '')
      })
    }
  };
}

// Revalidate every hour to balance freshness and performance
export const revalidate = 3600;

export async function generateStaticParams() {
  const { posts } = await getPosts(100); // Get first 100 posts for static generation
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  
  if (!post) {
    notFound();
  }

  // Get related posts by tags
  const relatedPosts = post.tags && post.tags.length > 0 
    ? await getPosts(3).then(result => 
        result.posts.filter(p => 
          p.slug !== post.slug && 
          p.tags?.some(tag => post.tags!.some(postTag => postTag.id === tag.id))
        ).slice(0, 3)
      )
    : [];

  return (
    <main className="min-h-screen bg-gradient-primary">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Back Link */}
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Post Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
            <span className="flex items-center gap-1">
              <CalendarDaysIcon className="w-4 h-4" />
              {formatDate(post.published_at)}
            </span>
            <span className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              {post.reading_time || 5} min read
            </span>
            {post.authors && post.authors.length > 0 && (
              <span>By {post.authors[0].name}</span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog/tag/${tag.slug}`}
                  className="flex items-center gap-1 text-sm text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 px-3 py-1 rounded-full transition-colors"
                >
                  <TagIcon className="w-3 h-3" />
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Image */}
      {post.feature_image && (
        <section className="relative">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="relative h-64 md:h-96 lg:h-[500px] rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={post.feature_image}
                alt={post.feature_image_alt || post.title}
                fill
                className="object-cover"
                priority
              />
              {post.feature_image_caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4">
                  <p className="text-sm">{post.feature_image_caption}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Article Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <article className="prose prose-lg prose-invert max-w-none">
            <div 
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
          </article>

          {/* Article Footer */}
          <div className="mt-16 pt-8 border-t border-gray-700">
            {/* Author Bio */}
            {post.authors && post.authors[0] && (
              <div className="flex items-start gap-4 mb-8 glass-morphism bg-black/80 border border-gray-700 rounded-xl p-6">
                {post.authors[0].profile_image && (
                  <Image
                    src={post.authors[0].profile_image}
                    alt={post.authors[0].name}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                )}
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {post.authors[0].name}
                  </h3>
                  {post.authors[0].bio && (
                    <p className="text-gray-300 mb-3">{post.authors[0].bio}</p>
                  )}
                  <div className="flex gap-4">
                    {post.authors[0].website && (
                      <a
                        href={post.authors[0].website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        Website
                      </a>
                    )}
                    {post.authors[0].twitter && (
                      <a
                        href={`https://twitter.com/${post.authors[0].twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        Twitter
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-gray-400">Share this article:</span>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://hudsondigitalsolutions.com/blog/${post.slug}`)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300"
              >
                Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://hudsondigitalsolutions.com/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300"
              >
                LinkedIn
              </a>
            </div>

            {/* CTA */}
            <div className="glass-morphism bg-black/80 border border-green-200 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Build Something Amazing?
              </h3>
              <p className="text-gray-300 mb-6">
                Let&apos;s discuss how I can help you implement these concepts in your next project.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-green-400 text-black font-semibold py-3 px-8 rounded-lg hover:bg-green-500 transition-colors"
                >
                  Start Your Project
                </Link>
                <Link
                  href="/contact"
                  className="border border-cyan-400 text-cyan-400 font-semibold py-3 px-8 rounded-lg hover:bg-cyan-400/10 transition-colors"
                >
                  Schedule a Call
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-gradient-primary border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <h2 className="text-3xl font-black text-white mb-8 text-center">
              Related Articles
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.id} className="group">
                  <div className="glass-morphism bg-black/80 border border-gray-700 rounded-xl overflow-hidden hover:border-cyan-300 transition-all duration-300 hover:scale-105">
                    {relatedPost.feature_image && (
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={relatedPost.feature_image}
                          alt={relatedPost.feature_image_alt || relatedPost.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <CalendarDaysIcon className="w-4 h-4" />
                          {formatDate(relatedPost.published_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {relatedPost.reading_time || 5} min
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                        <Link href={`/blog/${relatedPost.slug}`}>
                          {relatedPost.title}
                        </Link>
                      </h3>
                      
                      <p className="text-gray-300 mb-4 line-clamp-3">
                        {relatedPost.excerpt}
                      </p>
                      
                      <Link
                        href={`/blog/${relatedPost.slug}`}
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
    </main>
  );
}