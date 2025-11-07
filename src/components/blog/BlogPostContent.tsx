import type { Post } from "@/types/ghost-types";

interface BlogPostContentProps {
  post: Post;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  return (
    <div
      className="prose prose-lg prose-invert max-w-none
        prose-headings:text-white prose-headings:font-bold
        prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
        prose-p:text-gray-300 prose-p:leading-relaxed
        prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-white prose-strong:font-semibold
        prose-code:text-cyan-300 prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded
        prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700
        prose-blockquote:border-l-4 prose-blockquote:border-cyan-400 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400
        prose-ul:text-gray-300 prose-ol:text-gray-300
        prose-li:text-gray-300 prose-li:leading-relaxed
        prose-img:rounded-lg prose-img:shadow-lg"
      dangerouslySetInnerHTML={{ __html: post.html }}
    />
  );
}
