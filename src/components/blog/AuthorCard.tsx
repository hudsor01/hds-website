import Image from "next/image";
import Link from "next/link";
import type { BlogAuthor } from "@/lib/blog";

interface AuthorCardProps {
  author: BlogAuthor;
}

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-start gap-4">
        {author.profile_image && (
          <Image
            src={author.profile_image}
            alt={author.name}
            width={80}
            height={80}
            className="w-20 h-20 rounded-full object-cover"
          />
        )}
        <div className="flex-1">
          <Link href={`/blog/author/${author.slug}`} className="hover:text-cyan-400 transition-colors">
            <h3 className="text-xl font-bold text-white">{author.name}</h3>
          </Link>
          {author.bio && (
            <p className="text-muted-foreground mt-2">{author.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}
