'use client';

import DOMPurify from 'dompurify';
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

  const sanitizedContent = DOMPurify.sanitize(post.content, {
    ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'br', 'img'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
  });

  return (
    <div
      className="prose prose-invert prose-cyan max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
