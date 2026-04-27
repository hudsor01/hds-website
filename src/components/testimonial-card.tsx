import { MessageCircle, Star } from 'lucide-react'
import type { HTMLAttributes, Ref } from 'react'

import { GlassCard } from '@/components/glass-card'
import { cn } from '@/lib/utils'

export interface TestimonialCardProps extends HTMLAttributes<HTMLDivElement> {
	testimonialId?: number | string
	name: string
	company: string
	role: string
	content: string
	rating: number
	service?: string
	highlight?: string
	ref?: Ref<HTMLDivElement>
}

function TestimonialCard({
	className,
	name,
	company,
	role,
	content,
	rating,
	service,
	highlight,
	ref,
	...props
}: TestimonialCardProps) {
	return (
		<GlassCard
			ref={ref}
			variant="light"
			padding="lg"
			hover
			className={cn(
				'snap-center shrink-0 w-[90vw] md:w-auto h-full flex flex-col',
				className
			)}
			{...props}
		>
			<div className="mb-subheading">
				<div className="flex gap-tight">
					{[...Array(5)].map((_, i) => (
						<Star
							key={i}
							className={cn(
								'w-5 h-5',
								i < rating ? 'text-accent fill-accent' : 'text-muted-foreground'
							)}
						/>
					))}
				</div>
			</div>

			{highlight && (
				<div className="mb-card-content">
					<div className="px-4 py-2 text-xs font-semibold text-accent-foreground bg-accent border border-accent rounded-md inline-block">
						{highlight}
					</div>
				</div>
			)}

			<div className="mb-content-block flex-grow">
				<MessageCircle className="w-8 h-8 text-accent/30 mb-3" />
				<p className="text-muted-foreground leading-relaxed">
					&ldquo;{content}&rdquo;
				</p>
			</div>

			<div className="mt-auto pt-4">
				<div className="font-semibold text-foreground">{name}</div>
				<div className="text-xs text-muted-foreground">
					{role} at {company}
				</div>
				{service && <div className="text-xs text-accent mt-2">{service}</div>}
			</div>
		</GlassCard>
	)
}

export { TestimonialCard }
