import type { BlogPost } from "@/lib/blog";

interface BlogPostContentProps {
  post: BlogPost;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  if (!post.content) {
    return (
      <div className="prose prose-invert prose-cyan max-w-none">
        <p className="text-muted-foreground">
          This post content is coming soon. Check back later for the full article.
        </p>
      </div>
    );
  }

  return (
    <div
      className="prose prose-invert prose-cyan max-w-none"
      dangerouslySetInnerHTML={{ __html: post.content }}
    />
  );
}
