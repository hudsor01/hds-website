import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, User } from "lucide-react";
import type { BlogPost } from "@/lib/blog";
import { formatDate } from "@/lib/utils";

interface BlogPostCardProps {
  post: BlogPost;
  featured?: boolean;
}

export function BlogPostCard({ post, featured = false }: BlogPostCardProps) {
  return (
    <article className={`group ${featured ? "md:col-span-2" : ""}`}>
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="glass-card rounded-xl overflow-hidden hover:ring-2 hover:ring-accent/50 transition-all">
          {post.feature_image && (
            <div className={`relative ${featured ? "aspect-[2/1]" : "aspect-video"}`}>
              <Image
                src={post.feature_image}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes={featured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
              />
            </div>
          )}
          <div className="card-padding">
            {post.tags?.[0] && (
              <span className="inline-block text-sm text-accent font-medium mb-subheading">
                {post.tags[0].name}
              </span>
            )}
            <h3 className={`font-bold text-foreground mb-subheading group-hover:text-accent transition-colors ${featured ? "text-2xl" : "text-xl"}`}>
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="text-muted-foreground line-clamp-2 mb-heading">
                {post.excerpt}
              </p>
            )}
            <div className="flex flex-wrap gap-content text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{post.reading_time} min</span>
              </div>
              {post.author && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{post.author.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
