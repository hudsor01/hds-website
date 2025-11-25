import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, User, Globe } from "lucide-react";
import { getPostsByAuthor, getAuthorBySlug, getAuthors } from "@/lib/ghost";
import { BlogPostCard } from "@/components/blog/BlogPostCard";

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
}

// Next.js 16: Using cacheLife instead
// export const revalidate = 60;

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) {
    return {
      title: "Author Not Found - Hudson Digital Solutions",
      description: "The requested author could not be found.",
    };
  }

  return {
    title: `${author.name} - Blog Authors - Hudson Digital Solutions`,
    description: author.meta_description || author.bio || `Articles by ${author.name}`,
    openGraph: {
      title: `${author.name} - Hudson Digital Solutions`,
      description: author.meta_description || author.bio || `Articles by ${author.name}`,
      images: author.profile_image || author.cover_image ? [
        {
          url: author.profile_image || author.cover_image || "",
          width: 1200,
          height: 630,
          alt: author.name,
        },
      ] : [],
    },
    alternates: {
      canonical: `https://hudsondigitalsolutions.com/blog/author/${author.slug}`,
    },
  };
}

export async function generateStaticParams() {
  const authors = await getAuthors();
  const results = authors.map((author) => ({
    slug: author.slug,
  }));

  // Next.js 16: cacheComponents requires at least one static param
  if (results.length === 0) {
    return [{ slug: '__placeholder__' }];
  }

  return results;
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const [author, postsResult] = await Promise.all([
    getAuthorBySlug(slug),
    getPostsByAuthor(slug, { limit: 20 }),
  ]);

  if (!author) {
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

      {/* Author Header */}
      <section className="relative bg-gradient-hero py-16 overflow-hidden">
        {author.cover_image && (
          <div className="absolute inset-0 opacity-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={author.cover_image}
              alt={author.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 grid-pattern-subtle"></div>
        </div>

        <div className="relative container-wide text-center">
          <div className="inline-flex flex-center gap-2 px-4 py-2 mb-8 rounded-full border border-cyan-300 bg-cyan-400/10 text-cyan-400 font-semibold text-lg">
            <User className="w-5 h-5" />
            Author
          </div>

          {author.profile_image && (
            <div className="flex justify-center mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={author.profile_image}
                alt={author.name}
                className="w-32 h-32 rounded-full border-4 border-cyan-400"
              />
            </div>
          )}

          <h1 className="text-clamp-xl font-black text-white mb-6 text-balance">
            {author.name}
          </h1>

          {author.bio && (
            <p className="text-xl text-muted container-narrow text-pretty mb-6">
              {author.bio}
            </p>
          )}

          <div className="flex flex-center gap-4 mb-4">
            {author.website && (
              <a
                href={author.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Globe className="w-5 h-5" />
                Website
              </a>
            )}
            {author.twitter && (
              <a
                href={`https://twitter.com/${author.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Twitter
              </a>
            )}
            {author.facebook && (
              <a
                href={`https://facebook.com/${author.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Facebook
              </a>
            )}
          </div>

          <p className="text-muted-foreground">
            {posts.length} {posts.length === 1 ? "article" : "articles"}
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-16 bg-gradient-primary">
        <div className="container-wide">
          {posts.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-muted text-lg">No articles found for this author.</p>
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
