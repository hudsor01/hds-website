import Link from "next/link";
import type { Tag } from "@/types/ghost-types";

interface TagListProps {
  tags: Tag[];
  title?: string;
}

export function TagList({ tags, title = "Topics" }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4 text-balance">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/blog/tag/${tag.slug}`}
            className="text-sm text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 px-3 py-1 rounded-full transition-colors"
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
