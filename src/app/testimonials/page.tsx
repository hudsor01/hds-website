import { ArrowRight, MessageCircle, Star } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
	title: 'Client Testimonials | Hudson Digital Solutions',
	description:
		'Real client results with proven ROI and high satisfaction. See how Hudson Digital transformed businesses through revenue-focused engineering. Success stories from growing companies.',
	keywords:
		'client testimonials, customer reviews, success stories, client feedback, case studies, ROI results, business transformation'
}

const testimonials = [
	{
		id: 1,
		name: 'Michael Chen',
		company: 'Riverside Plumbing Co.',
		role: 'Owner',
		content:
			'Hudson Digital Solutions delivered beyond our expectations. They built us a website and booking system that doubled our inbound leads within 60 days.',
		rating: 5,
		service: 'Business Website',
		highlight: '2x More Leads'
	},
	{
		id: 2,
		name: 'Sarah Johnson',
		company: 'E-Commerce Plus',
		role: 'CEO',
		content:
			"The team's expertise in Next.js and modern web technologies helped us achieve a 60% improvement in conversion rates.",
		rating: 5,
		service: 'E-Commerce Platform',
		highlight: '60% More Sales'
	},
	{
		id: 3,
		name: 'David Martinez',
		company: 'Wellness App Co',
		role: 'Product Manager',
		content:
			'From concept to launch in just 8 weeks. The efficiency and quality of work was exceptional.',
		rating: 5,
		service: 'Mobile App Backend',
		highlight: '8 Week Launch'
	},
	{
		id: 4,
		name: 'Emily Thompson',
		company: 'FinTech Solutions',
		role: 'Founder',
		content:
			'Professional, reliable, and technically excellent. Hudson Digital Solutions understood our vision and brought it to life with clean, scalable code.',
		rating: 5,
		service: 'Custom Development',
		highlight: 'Zero Downtime'
	},
	{
		id: 5,
		name: 'Lisa Park',
		company: 'Revenue Rocket',
		role: 'Operations Manager',
		content:
			'The SalesLoft integration and automation setup has saved us countless hours. Our sales team is more productive than ever.',
		rating: 5,
		service: 'Revenue Operations',
		highlight: '40 Hours/Week Saved'
	},
	{
		id: 6,
		name: 'James Wilson',
		company: 'Partner Connect',
		role: 'CEO',
		content:
			'Excellent communication throughout the project. They delivered a robust partner management system that scales with our growing business.',
		rating: 5,
		service: 'Partnership Management',
		highlight: '3x Partner Growth'
	}
]

const StarRating = ({ rating }: { rating: number }) => {
	return (
		<div className="flex gap-1">
			{[...Array(5)].map((_, i) => (
				<Star
					key={i}
					className={`w-5 h-5 ${i < rating ? 'text-accent fill-accent' : 'text-muted-foreground'}`}
				/>
			))}
		</div>
	)
}

export default function TestimonialsPage() {
	return (
		<main className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-background">
				<div
					className="absolute inset-0 grid-pattern-subtle dark:grid-pattern-dark pointer-events-none"
					aria-hidden="true"
				/>
				<div
					className="hero-spotlight absolute inset-0 pointer-events-none"
					aria-hidden="true"
				/>
				<div className="relative z-10 container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
					<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
						Client Success Stories
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Real Results. Real Clients.
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
						Don&apos;t just take our word for it. See what businesses are
						achieving with our revenue-focused engineering solutions.
					</p>
				</div>
			</section>

			{/* Stats Bar */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border/30 rounded-2xl overflow-hidden">
						<div className="bg-background px-8 py-10 text-center relative overflow-hidden">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
							<div className="text-4xl font-black text-accent mb-2 tabular-nums">
								100%
							</div>
							<div className="text-xs text-muted-foreground">
								Client Satisfaction
							</div>
						</div>
						<div className="bg-background px-8 py-10 text-center relative overflow-hidden">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
							<div className="text-4xl font-black text-accent mb-2 tabular-nums">
								Growing
							</div>
							<div className="text-xs text-muted-foreground">
								Projects Delivered
							</div>
						</div>
						<div className="bg-background px-8 py-10 text-center relative overflow-hidden">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
							<div className="text-4xl font-black text-accent mb-2 tabular-nums">
								3.5x
							</div>
							<div className="text-xs text-muted-foreground">Average ROI</div>
						</div>
						<div className="bg-background px-8 py-10 text-center relative overflow-hidden">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
							<div className="text-4xl font-black text-accent mb-2 tabular-nums">
								24hr
							</div>
							<div className="text-xs text-muted-foreground">Response Time</div>
						</div>
					</div>
				</div>
			</section>

			{/* Testimonials Grid */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							Testimonials
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							What Our Clients Say
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Every testimonial represents a business that chose excellence over
							mediocrity
						</p>
					</div>

					<div className="flex md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none md:grid-cols-2 lg:grid-cols-3 gap-6 scrollbar-hide">
						{testimonials.map(testimonial => (
							<div
								key={testimonial.id}
								className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors snap-center shrink-0 w-[90vw] md:w-auto"
							>
								{/* Rating */}
								<div className="mb-4">
									<StarRating rating={testimonial.rating} />
								</div>

								{/* Highlight Label */}
								<div className="mb-6">
									<span className="px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold">
										{testimonial.highlight}
									</span>
								</div>

								{/* Quote */}
								<div className="mb-6">
									<MessageCircle className="w-8 h-8 text-accent/30 mb-3" />
									<p className="text-sm text-muted-foreground leading-relaxed">
										&ldquo;{testimonial.content}&rdquo;
									</p>
								</div>

								{/* Client Info */}
								<div className="border-t border-border pt-6">
									<div className="font-semibold text-foreground text-sm">
										{testimonial.name}
									</div>
									<div className="text-xs text-muted-foreground mt-0.5">
										{testimonial.role} at {testimonial.company}
									</div>
									<div className="text-xs text-accent mt-2">
										{testimonial.service}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-section px-4 sm:px-6">
				<div className="container-wide">
					<div className="relative overflow-hidden rounded-2xl border border-border bg-surface-raised p-10 md:p-16 text-center">
						<div
							className="hero-spotlight absolute inset-0 opacity-60 pointer-events-none"
							aria-hidden="true"
						/>
						<div className="relative z-10">
							<h2 className="text-section-title text-foreground mb-6 max-w-3xl mx-auto text-balance">
								Ready to be our next{' '}
								<span className="text-accent">success story?</span>
							</h2>

							<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
								Join the growing list of businesses that have transformed their
								technical capabilities with Hudson Digital Solutions.
							</p>

							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<Button
									asChild
									variant="accent"
									size="xl"
									trackConversion={true}
								>
									<Link href="/contact">
										Start Your Transformation
										<ArrowRight className="w-5 h-5" />
									</Link>
								</Button>

								<Button
									asChild
									variant="outline"
									size="xl"
									className="border-2 border-foreground/25 hover:border-accent dark:border-foreground/20"
								>
									<Link href="/showcase">View Portfolio</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
