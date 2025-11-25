import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import type { Post } from "@/types/ghost-types";
import { formatDateLong } from "@/lib/utils";

interface RelatedPostsProps {
  posts: Post[];
  title?: string;
}

export function RelatedPosts({ posts, title = "Related Articles" }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-primary">
      <div className="container-wide">
        <h2 className="text-3xl font-black text-white mb-8 text-balance">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="group">
              <div className="glass-card rounded-xl overflow-hidden hover:border-cyan-300 transition-all duration-300">
                {post.feature_image && (
                  <div className="relative h-48 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.feature_image}
                      alt={post.feature_image_alt || post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex flex-center gap-3 text-sm text-muted-foreground mb-3">
                    <span>{formatDateLong(post.published_at)}</span>
                    <span className="flex flex-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.reading_time} min
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors text-balance">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-muted mb-4 line-clamp-2 text-pretty">
                    {post.excerpt || post.custom_excerpt}
                  </p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex flex-center gap-2 link-primary font-semibold"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
