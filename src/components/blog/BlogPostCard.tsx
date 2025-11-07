import { ArrowRightIcon, CalendarDaysIcon, ClockIcon, TagIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { Post } from "@/types/ghost-types";
import { formatDateLong } from "@/lib/utils";

interface BlogPostCardProps {
  post: Post;
  featured?: boolean;
}

export function BlogPostCard({ post, featured = false }: BlogPostCardProps) {
  const tags = post.tags || [];
  const author = post.primary_author || post.authors?.[0];

  return (
    <article className={`group ${featured ? 'lg:col-span-2' : ''}`}>
      <div className="glass-card rounded-xl overflow-hidden hover:border-cyan-300 transition-all duration-300 hover:scale-105 will-change-transform transform-gpu">
        {post.feature_image && (
          <div className="relative h-48 md:h-64 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.feature_image}
              alt={post.feature_image_alt || post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-8">
          <div className="flex flex-center gap-4 text-sm text-gray-400 mb-4">
            <span className="flex flex-center gap-1">
              <CalendarDaysIcon className="w-4 h-4" />
              {formatDateLong(post.published_at)}
            </span>
            <span className="flex flex-center gap-1">
              <ClockIcon className="w-4 h-4" />
              {post.reading_time} min read
            </span>
            {post.featured && (
              <span className="px-3 py-1 bg-cyan-400 text-black text-xs font-bold rounded-full">
                FEATURED
              </span>
            )}
          </div>

          <h3 className={`${featured ? 'text-responsive-md' : 'text-2xl'} font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors text-balance`}>
            <Link href={`/blog/${post.slug}`}>
              {post.title}
            </Link>
          </h3>

          <p className="text-gray-300 mb-6 text-lg leading-relaxed text-pretty line-clamp-3">
            {post.excerpt || post.custom_excerpt}
          </p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog/tag/${tag.slug}`}
                  className="flex flex-center gap-1 text-xs text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full hover:bg-cyan-400/20 transition-colors"
                >
                  <TagIcon className="w-3 h-3" />
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

          {author && (
            <div className="flex flex-center gap-2 text-sm text-gray-500 mb-4">
              {author.profile_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={author.profile_image}
                  alt={author.name}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span>By {author.name}</span>
            </div>
          )}

          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex flex-center gap-2 link-primary font-semibold text-lg"
          >
            Read Full Article
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
