'use client'

import { cva } from 'class-variance-authority'
import { ArrowRight, MessageCircle, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { ComponentType, HTMLAttributes, Ref, SVGProps } from 'react'
import { Icon } from '@/components/utilities/Icon'
import { cn } from '@/lib/utils'

const cardVariants = cva(
	'rounded-xl border bg-card text-card-foreground transition-smooth',
	{
		variants: {
			variant: {
				default: 'border-border-subtle shadow-sm',
				glass: 'glass-card',
				glassLight: 'glass-card-light',
				glassSection: 'glass-card-light',
				outline: 'border-2 border-accent/30 bg-transparent'
			},
			size: {
				sm: 'card-padding-sm',
				md: 'card-padding',
				lg: 'card-padding-lg',
				xl: 'p-12 md:p-16',
				none: ''
			},
			hover: {
				true: 'card-hover-glow',
				false: ''
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'md',
			hover: false
		}
	}
)

// Intrinsic size of the project screenshots in public/images/showcase.
const SHOWCASE_IMAGE_WIDTH = 2880
const SHOWCASE_IMAGE_HEIGHT = 1800

// Base Card props
interface BaseCardProps extends HTMLAttributes<HTMLDivElement> {
	variant?: 'default' | 'glass' | 'glassLight' | 'glassSection' | 'outline'
	size?: 'sm' | 'md' | 'lg' | 'xl' | 'none'
	hover?: boolean
	ref?: Ref<HTMLDivElement>
}

// Service Card props
interface ServiceCardProps extends Omit<BaseCardProps, 'variant'> {
	variant: 'service'
	title: string
	description: string
	features: string[]
	icon: ComponentType<SVGProps<SVGSVGElement>>
	gradient?: string
	/** Detail page the title links to. */
	href?: string
}

// Project Card props
interface ProjectCardProps extends Omit<BaseCardProps, 'variant'> {
	variant: 'project'
	id: string
	slug: string
	title: string
	description: string
	category: string
	industry?: string
	showcaseType?: 'quick' | 'detailed'
	featured?: boolean
	stats?: Record<string, string>
	tech_stack: string[]
	externalLink?: string | null
	imageUrl?: string | null
	imageAlt?: string
}

// Testimonial Card props
interface TestimonialCardProps extends Omit<BaseCardProps, 'variant' | 'id'> {
	variant: 'testimonial'
	testimonialId: number | string
	name: string
	company: string
	role: string
	content: string
	rating: number
	service?: string
	highlight?: string
}

// Discriminated union of all card types
type CardProps =
	| BaseCardProps
	| ServiceCardProps
	| ProjectCardProps
	| TestimonialCardProps

function Card(props: CardProps) {
	const { className, variant, size, hover, ref, ...rest } =
		props as BaseCardProps

	// Service Card
	if ('variant' in props && props.variant === 'service') {
		const {
			title,
			description,
			features,
			icon,
			gradient = 'bg-muted',
			href
		} = props as ServiceCardProps

		return (
			<div
				ref={ref}
				className={cn(
					cardVariants({ variant: 'glassLight', size: 'lg', hover: true }),
					'group',
					className
				)}
			>
				<div className="space-y-comfortable">
					{/* Icon and Title */}
					<div className="flex items-center space-x-4">
						<div
							className={cn(
								'p-3 rounded-xl border border-current/30',
								'hover-lift transition-smooth',
								gradient
							)}
						>
							<Icon icon={icon} size="lg" className="text-foreground" />
						</div>
						<h3 className="text-h4 text-foreground">
							{href ? (
								<Link
									href={href}
									className="hover:text-accent-text transition-colors"
								>
									{title}
								</Link>
							) : (
								title
							)}
						</h3>
					</div>

					{/* Description */}
					<p className="text-muted-foreground leading-relaxed">{description}</p>

					{/* Features */}
					<ul className="space-y-3">
						{features.map((feature, index) => (
							<li key={index} className="flex items-start space-x-3">
								<svg
									aria-hidden="true"
									className="w-5 h-5 text-accent mt-0.5 shrink-0"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clipRule="evenodd"
									/>
								</svg>
								<span className="text-muted-foreground">{feature}</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		)
	}

	// Project Card, content-first layout with optional image header
	if ('variant' in props && props.variant === 'project') {
		const {
			id: _id,
			slug,
			title,
			description,
			category,
			showcaseType,
			featured = false,
			stats = {},
			tech_stack,
			imageUrl,
			imageAlt
		} = props as ProjectCardProps

		const metricEntries = Object.entries(stats).slice(0, 3)
		const hasImage = Boolean(imageUrl)
		const resolvedAlt = imageAlt ?? `${title} homepage`

		const cardContent = (
			<div
				className={cn(
					cardVariants({ variant: 'glass', size: 'none', hover: true }),
					'h-full overflow-hidden'
				)}
			>
				{/* Header: image when imageUrl is provided, accent bar otherwise */}
				{hasImage ? (
					<div
						className={cn(
							'relative w-full overflow-hidden bg-muted',
							featured ? 'aspect-16/10' : 'aspect-video'
						)}
					>
						{/* Explicit width/height (every showcase screenshot is
						    2880x1800) instead of `fill`, so the img carries its
						    intrinsic size; the aspect-ratio wrapper still sets the
						    box and object-cover crops the same way. */}
						<Image
							src={imageUrl as string}
							alt={resolvedAlt}
							width={SHOWCASE_IMAGE_WIDTH}
							height={SHOWCASE_IMAGE_HEIGHT}
							className="absolute inset-0 h-full w-full object-cover object-top"
							sizes={
								featured
									? '(min-width: 1024px) 60vw, 100vw'
									: '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
							}
							priority={featured}
						/>
						{/* Overlay pills: eyebrow + showcase type + featured */}
						<div className="absolute top-3 left-3 right-3 flex items-center gap-2 flex-wrap">
							<span className="px-2 py-0.5 rounded-full text-eyebrow bg-card/90 border border-border">
								{category}
							</span>
							{showcaseType && (
								<span className="px-2 py-0.5 rounded-full text-xs font-semibold text-accent-text bg-card/90 border border-border">
									{showcaseType === 'detailed' ? 'Case Study' : 'Portfolio'}
								</span>
							)}
							{featured && (
								<span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-accent text-accent-foreground">
									Featured
								</span>
							)}
						</div>
					</div>
				) : (
					<div className="h-1 bg-accent" />
				)}

				{/* Content */}
				<div className="card-padding-lg flex flex-col gap-4">
					{/* Category row: badges + featured tag (suppressed when image overlay carries them) */}
					{!hasImage && (
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-eyebrow">{category}</span>
							{showcaseType && (
								<span
									className={cn(
										'px-2 py-0.5 rounded-full text-xs font-semibold border',
										showcaseType === 'detailed'
											? 'bg-accent/10 text-accent-text border-accent/20'
											: 'bg-muted text-muted-foreground border-border'
									)}
								>
									{showcaseType === 'detailed' ? 'Case Study' : 'Portfolio'}
								</span>
							)}
							{featured && (
								<span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-accent text-accent-foreground">
									Featured
								</span>
							)}
						</div>
					)}

					{/* Title */}
					<h3 className="text-xl lg:text-2xl font-black text-foreground leading-tight group-hover:text-accent-text transition-colors">
						{title}
					</h3>

					{/* Description — 2-line clamp */}
					<p className="text-muted-foreground leading-relaxed line-clamp-2">
						{description}
					</p>

					{/* Inline metrics — max 3 */}
					{metricEntries.length > 0 && (
						<div className="flex items-start gap-6 flex-wrap">
							{metricEntries.map(([key, value]) => (
								<div key={key}>
									<div className="text-xl font-black text-foreground">
										{value}
									</div>
									<div className="text-xs text-muted-foreground capitalize">
										{key.replace(/([A-Z])/g, ' $1').trim()}
									</div>
								</div>
							))}
						</div>
					)}

					{/* Tech stack — max 5 chips */}
					{tech_stack.length > 0 && (
						<div className="flex flex-wrap gap-1.5">
							{tech_stack.slice(0, 5).map(tech => (
								<span
									key={tech}
									className="px-2.5 py-0.5 bg-muted border border-border rounded-full text-xs text-muted-foreground"
								>
									{tech}
								</span>
							))}
						</div>
					)}

					{/* View link hint — visible on hover */}
					<div className="flex items-center gap-1.5 text-sm font-semibold text-accent-text opacity-0 group-hover:opacity-100 transition-opacity">
						View Project
						<ArrowRight className="w-4 h-4" aria-hidden="true" />
					</div>
				</div>
			</div>
		)

		return (
			<div
				ref={ref}
				className={cn('group relative', featured && 'md:col-span-2', className)}
			>
				{/* Always link to the internal /showcase/[slug] detail page. The
				    card used to wrap the whole tile in an external <a> whenever
				    externalLink was set - and every showcase row has one - so the
				    list never linked to any detail page, orphaning them (and the
				    followed richardwhudsonjr.com link they carry) from internal
				    PageRank. Users reach the live site from the detail page.
				    The link is a block with the card radius: an inline <a>
				    around block content paints no focus outline. */}
				<Link
					href={`/showcase/${slug}`}
					aria-label={`View project: ${title}`}
					className="block h-full rounded-xl"
				>
					{cardContent}
				</Link>
			</div>
		)
	}

	// Testimonial Card
	if ('variant' in props && props.variant === 'testimonial') {
		const {
			testimonialId: _testimonialId,
			name,
			company,
			role,
			content,
			rating,
			service,
			highlight
		} = props as TestimonialCardProps

		return (
			<div
				ref={ref}
				className={cn(
					cardVariants({ variant: 'glassLight', size: 'lg', hover: true }),
					'snap-center shrink-0 w-[90vw] md:w-auto h-full flex flex-col',
					className
				)}
			>
				{/* Rating */}
				<div className="mb-subheading">
					<div className="flex gap-tight">
						{[...Array(5)].map((_, i) => (
							<Star
								key={i}
								className={cn(
									'w-5 h-5',
									i < rating
										? 'text-accent fill-accent'
										: 'text-muted-foreground'
								)}
							/>
						))}
					</div>
				</div>

				{/* Highlight Label */}
				{highlight && (
					<div className="mb-card-content">
						<div className="px-4 py-2 text-xs font-semibold text-accent-foreground bg-accent border border-accent rounded-md inline-block">
							{highlight}
						</div>
					</div>
				)}

				{/* Quote */}
				<div className="mb-content-block flex-grow">
					<MessageCircle className="w-8 h-8 text-accent/30 mb-3" />
					<p className="text-muted-foreground leading-relaxed">
						&ldquo;{content}&rdquo;
					</p>
				</div>

				{/* Client Info */}
				<div className="border-t border-border pt-6 flex items-center gap-3">
					<div
						className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0"
						aria-hidden="true"
					>
						<span className="text-accent-text font-bold text-sm">
							{name
								.split(' ')
								.filter(Boolean)
								.slice(0, 2)
								.map(w => w[0])
								.join('')
								.toUpperCase()}
						</span>
					</div>
					<div>
						<div className="font-semibold text-foreground">{name}</div>
						<div className="text-xs text-muted-foreground">
							{role} at {company}
						</div>
						{service && (
							<div className="text-xs text-accent-text mt-2">{service}</div>
						)}
					</div>
				</div>
			</div>
		)
	}

	// Default/Base Card (compositional primitive)
	return (
		<div
			ref={ref}
			className={cn(
				cardVariants({
					variant: variant ?? 'default',
					size: size ?? 'md',
					hover: hover ?? false
				}),
				className
			)}
			{...rest}
		/>
	)
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={cn('flex flex-col space-y-1.5', className)} {...props} />
	)
}

function CardTitle({
	className,
	...props
}: HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h3
			className={cn('text-lg font-semibold text-foreground', className)}
			{...props}
		/>
	)
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('pt-0', className)} {...props} />
}

export { Card, CardContent, CardHeader, CardTitle }
