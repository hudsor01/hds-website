'use client';

import Link from "next/link";
import { Tag } from "lucide-react";
import type { BlogTag } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";

interface TagListProps {
  tags: BlogTag[];
}

export function TagList({ tags }: TagListProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-tight">
      {tags.map((tag) => (
        <Badge key={tag.id} variant="accent" asChild>
          <Link href={`/blog/tag/${tag.slug}`} className="flex items-center gap-1 text-sm px-3 py-1">
            <Tag className="w-4 h-4" />
            {tag.name}
          </Link>
        </Badge>
      ))}
    </div>
  );
}
