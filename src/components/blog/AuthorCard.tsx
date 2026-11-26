import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import type { BlogAuthor } from '@/lib/blog'

interface AuthorCardProps {
	author: BlogAuthor
}

export function AuthorCard({ author }: AuthorCardProps) {
	return (
		<Card variant="glass">
			<div className="flex items-start gap-content">
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
					{/* The link sits inside the heading: an inline <a> around a
					    block <h3> has no line box of its own, so its focus
					    outline would not paint. */}
					<h3 className="text-xl font-bold text-foreground">
						<Link
							href={`/blog/author/${author.slug}`}
							className="hover:text-accent-text transition-colors"
						>
							{author.name}
						</Link>
					</h3>
					{author.bio && (
						<p className="text-muted-foreground mt-2">{author.bio}</p>
					)}
				</div>
			</div>
		</Card>
	)
}
