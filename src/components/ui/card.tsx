'use client'

import { cva } from 'class-variance-authority'
import { ExternalLink, MessageCircle, Star, X } from 'lucide-react'
import Link from 'next/link'
import type { ComponentType, SVGProps } from 'react'
import * as React from 'react'
import { Icon } from '@/components/utilities/Icon'
import { cn } from '@/lib/utils'
import { Button } from './button'

const cardVariants = cva(
	'rounded-xl border bg-card text-card-foreground transition-smooth',
	{
		variants: {
			variant: {
				default: 'border-border-subtle bg-surface-raised shadow-sm',
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
				true: 'card-hover-glow hover-lift',
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

// Base Card props
interface BaseCardProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: 'default' | 'glass' | 'glassLight' | 'glassSection' | 'outline'
	size?: 'sm' | 'md' | 'lg' | 'xl' | 'none'
	hover?: boolean
}

// Service Card props
interface ServiceCardProps extends Omit<BaseCardProps, 'variant'> {
	variant: 'service'
	title: string
	description: string
	features: string[]
	icon: ComponentType<SVGProps<SVGSVGElement>>
	gradient?: string
}

// Pricing Card props
interface PricingCardProps extends Omit<BaseCardProps, 'variant'> {
	variant: 'pricing'
	name: string
	price: string
	description: string
	features: string[]
	notIncluded?: string[]
	popular?: boolean
	cta: string
	href: string
	roi?: string
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
export type CardProps =
	| BaseCardProps
	| ServiceCardProps
	| PricingCardProps
	| ProjectCardProps
	| TestimonialCardProps

const Card = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
	const { className, variant, size, hover, ...rest } = props as BaseCardProps

	// Service Card
	if ('variant' in props && props.variant === 'service') {
		const {
			title,
			description,
			features,
			icon,
			gradient = 'bg-muted'
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
								'hover-lift transition-smooth will-change-transform',
								gradient
							)}
						>
							<Icon icon={icon} size="lg" className="text-foreground" />
						</div>
						<h3 className="text-h4 text-foreground">{title}</h3>
					</div>

					{/* Description */}
					<p className="text-muted-foreground leading-relaxed">{description}</p>

					{/* Features */}
					<ul className="space-y-3">
						{features.map((feature, index) => (
							<li key={index} className="flex items-start space-x-3">
								<svg
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

	// Pricing Card
	if ('variant' in props && props.variant === 'pricing') {
		const {
			name,
			price,
			description,
			features,
			notIncluded = [],
			popular = false,
			cta,
			href,
			roi
		} = props as PricingCardProps

		return (
			<div ref={ref} className={cn('relative', className)}>
				{/* Popular Label */}
				{popular && (
					<div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
						<div className="px-3 py-1 text-xs font-bold text-accent-foreground bg-accent rounded-md shadow-lg">
							MOST POPULAR
						</div>
					</div>
				)}

				{/* Card Container */}
				<div
					className={cn(
						cardVariants({ variant: 'glassLight', size: 'lg', hover: true }),
						'group h-full flex flex-col',
						popular && 'border-accent/50 shadow-xl'
					)}
				>
					{/* Header Section */}
					<div className="text-center mb-comfortable">
						<h3 className="text-h4 text-foreground mb-subheading text-balance group-hover:text-accent transition-colors">
							{name}
						</h3>
						<div className="text-section-title font-black text-accent mb-subheading">
							{price}
						</div>
						<div className="typography">
							<p className="text-muted-foreground leading-relaxed text-pretty">
								{description}
							</p>
						</div>
					</div>

					{/* ROI Badge */}
					{roi && (
						<div className="mb-card-content p-button bg-success-text/10 border border-success-text/30 rounded-lg">
							<p className="text-xs font-bold text-success-text text-center">
								{roi}
							</p>
						</div>
					)}

					{/* Features & Exclusions */}
					<div className="space-y-content mb-comfortable flex-grow">
						{/* Included Features */}
						<div>
							<h4 className="text-eyebrow text-muted-foreground mb-subheading">
								What&apos;s Included
							</h4>
							<ul className="space-y-tight">
								{features.map((feature, idx) => (
									<li key={idx} className="flex items-start gap-content">
										<div className="w-2 h-2 rounded-full bg-muted mt-2 shrink-0" />
										<span className="text-xs text-muted-foreground">
											{feature}
										</span>
									</li>
								))}
							</ul>
						</div>

						{/* Not Included */}
						{notIncluded.length > 0 && (
							<div>
								<h4 className="text-eyebrow text-muted-foreground mb-subheading mt-card-content">
									Not Included
								</h4>
								<ul className="space-y-tight">
									{notIncluded.map((item, idx) => (
										<li key={idx} className="flex items-start gap-content">
											<X className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
											<span className="text-sm text-muted-foreground">
												{item}
											</span>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>

					{/* CTA Button */}
					<Button
						asChild
						variant={popular ? 'default' : 'secondary'}
						size="lg"
						className="w-full font-bold"
					>
						<Link href={href}>{cta}</Link>
					</Button>
				</div>
			</div>
		)
	}

	// Project Card — content-first layout with accent bar
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
			externalLink
		} = props as ProjectCardProps

		const metricEntries = Object.entries(stats).slice(0, 3)
		const isExternal = Boolean(externalLink)

		const cardContent = (
			<div
				className={cn(
					cardVariants({ variant: 'glass', size: 'none', hover: true }),
					'h-full overflow-hidden'
				)}
			>
				{/* Top accent bar */}
				<div className="h-1 bg-accent" />

				{/* Content */}
				<div className="card-padding-lg flex flex-col gap-4">
					{/* Category row: badges + featured tag */}
					<div className="flex items-center gap-2 flex-wrap">
						<span className="text-xs font-semibold uppercase tracking-widest text-accent">
							{category}
						</span>
						{showcaseType && (
							<span
								className={cn(
									'px-2 py-0.5 rounded-full text-xs font-semibold border',
									showcaseType === 'detailed'
										? 'bg-accent/10 text-accent border-accent/20'
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

					{/* Title */}
					<h3 className="text-xl lg:text-2xl font-black text-foreground leading-tight group-hover:text-accent transition-colors">
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
					<div className="flex items-center gap-1.5 text-sm font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
						View Project
						<ExternalLink className="w-4 h-4" aria-hidden="true" />
					</div>
				</div>
			</div>
		)

		return (
			<div
				ref={ref}
				className={cn('group relative', featured && 'md:col-span-2', className)}
			>
				{isExternal ? (
					<a
						href={externalLink as string}
						aria-label={`View project: ${title}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						{cardContent}
					</a>
				) : (
					<Link
						href={`/showcase/${slug}`}
						aria-label={`View project: ${title}`}
					>
						{cardContent}
					</Link>
				)}
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
						className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex-center shrink-0"
						aria-hidden="true"
					>
						<span className="text-accent font-bold text-sm">
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
							<div className="text-xs text-accent mt-2">{service}</div>
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
})
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn('flex flex-col space-y-1.5', className)}
		{...props}
	/>
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h3
		ref={ref}
		className={cn(
			'text-2xl font-semibold leading-none tracking-tight',
			className
		)}
		{...props}
	/>
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn('text-sm text-muted-foreground', className)}
		{...props}
	/>
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn('pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn('flex items-center pt-0', className)}
		{...props}
	/>
))
CardFooter.displayName = 'CardFooter'

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
