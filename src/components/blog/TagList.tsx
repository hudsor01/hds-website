import Link from "next/link";
import { Tag } from "lucide-react";
import type { BlogTag } from "@/lib/blog";

interface TagListProps {
  tags: BlogTag[];
}

export function TagList({ tags }: TagListProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/blog/tag/${tag.slug}`}
          className="flex items-center gap-1 text-sm text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 px-3 py-1 rounded-full transition-colors"
        >
          <Tag className="w-4 h-4" />
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
