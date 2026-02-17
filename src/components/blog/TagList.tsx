'use client';

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
          className="flex items-center gap-1 text-sm px-3 py-1 text-accent hover:text-accent-foreground hover:bg-accent border border-accent/30 rounded-md transition-colors"
        >
          <Tag className="w-4 h-4" />
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
