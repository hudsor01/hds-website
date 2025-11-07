import { GlobeAltIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { Author } from "@/types/ghost-types";

interface AuthorCardProps {
  author: Author;
}

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex gap-4">
        {author.profile_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={author.profile_image}
            alt={author.name}
            className="w-16 h-16 rounded-full flex-shrink-0"
          />
        )}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">
            <Link href={`/blog/author/${author.slug}`} className="hover:text-cyan-400 transition-colors">
              {author.name}
            </Link>
          </h3>
          {author.bio && (
            <p className="text-gray-300 text-sm mb-3">{author.bio}</p>
          )}
          <div className="flex flex-wrap gap-3 text-sm">
            {author.website && (
              <a
                href={author.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <GlobeAltIcon className="w-4 h-4" />
                Website
              </a>
            )}
            {author.twitter && (
              <a
                href={`https://twitter.com/${author.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Twitter
              </a>
            )}
            {author.facebook && (
              <a
                href={`https://facebook.com/${author.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Facebook
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
