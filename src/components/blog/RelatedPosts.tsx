import type { BlogPost } from "@/lib/blog";
import { BlogPostCard } from "./BlogPostCard";

interface RelatedPostsProps {
  posts: BlogPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-section-sm bg-background">
      <div className="container-wide">
        <h2 className="text-2xl font-bold text-primary-foreground mb-comfortable">Related Posts</h2>
        <div className="grid gap-sections md:grid-cols-3">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
