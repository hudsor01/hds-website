import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAuthorBySlug, getPostsByAuthor, getAuthors } from "@/lib/blog";
import { BlogPostCard } from "@/components/blog/BlogPostCard";

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
}

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
    title: `${author.name} - Blog - Hudson Digital Solutions`,
    description: author.bio || `Articles by ${author.name}`,
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

  if (results.length === 0) {
    return [{ slug: '__placeholder__' }];
  }

  return results;
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  const posts = await getPostsByAuthor(author.slug);

  return (
    <main className="min-h-screen bg-background">
      {/* Back to Blog */}
      <div className="container-wide py-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-tight text-accent hover:text-accent/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Blog
        </Link>
      </div>

      {/* Header */}
      <section className="relative bg-background py-section-sm overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 surface-overlay"></div>
        </div>

        <div className="relative container-wide">
          <div className="flex flex-col md:flex-row items-center gap-sections">
            {author.profile_image && (
              <Image
                src={author.profile_image}
                alt={author.name}
                width={160}
                height={160}
                className="w-40 h-40 rounded-full object-cover"
              />
            )}
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black text-foreground mb-heading">
                {author.name}
              </h1>
              {author.bio && (
                <p className="text-xl text-muted-foreground max-w-2xl">
                  {author.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-section-sm">
        <div className="container-wide">
          <h2 className="text-2xl font-bold text-foreground mb-comfortable">
            Articles by {author.name}
          </h2>
          {posts.length > 0 ? (
            <div className="grid gap-sections md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-section-sm">
              <p className="text-muted-foreground text-lg">
                No posts by this author yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
