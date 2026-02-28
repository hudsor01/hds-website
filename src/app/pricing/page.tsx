import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { JsonLd } from '@/components/utilities/JsonLd'

export const metadata: Metadata = {
	title: 'Pricing | Hudson Digital Solutions',
	description:
		'Transparent pricing for custom web development, React applications, and digital solutions. Get your free consultation and project estimate today.',
	keywords:
		'web development pricing, custom software cost, React development rates, consultation pricing',
	openGraph: {
		title: 'Pricing | Hudson Digital Solutions',
		description:
			'Transparent pricing for custom web development and digital solutions',
		url: 'https://hudsondigitalsolutions.com/pricing'
	}
}

const faqPageSchema = {
	'@context': 'https://schema.org',
	'@type': 'FAQPage',
	mainEntity: [
		{
			'@type': 'Question',
			name: 'Why do prices start at these amounts?',
			acceptedAnswer: {
				'@type': 'Answer',
				text: 'Our starting prices reflect the quality and expertise we bring to every project. We focus on delivering business value through custom solutions, not template-based work.'
			}
		},
		{
			'@type': 'Question',
			name: 'What factors affect the final project cost?',
			acceptedAnswer: {
				'@type': 'Answer',
				text: 'Project complexity, timeline requirements, third-party integrations, custom features, and ongoing maintenance needs all influence the final investment.'
			}
		},
		{
			'@type': 'Question',
			name: 'Do you offer payment plans?',
			acceptedAnswer: {
				'@type': 'Answer',
				text: 'Yes, we typically structure payments in milestones: 50% to start, 30% at midpoint, and 20% upon completion. Custom arrangements available for larger projects.'
			}
		},
		{
			'@type': 'Question',
			name: "What's included in the free consultation?",
			acceptedAnswer: {
				'@type': 'Answer',
				text: 'A 60-minute strategy session where we analyze your requirements, discuss technical options, and provide a detailed project estimate with timeline.'
			}
		},
		{
			'@type': 'Question',
			name: 'Do you provide ongoing support?',
			acceptedAnswer: {
				'@type': 'Answer',
				text: 'We offer various maintenance packages including bug fixes, security updates, feature enhancements, and technical support tailored to your needs.'
			}
		}
	]
}

const pricingTiers = [
	{
		name: 'Website Performance Audit',
		price: 'Starting at $2,000',
		description:
			'Find exactly where your website is losing visitors, leads, and customers. Get a clear action plan in 2-4 weeks.',
		features: [
			'Complete website review',
			'Missed opportunity identification',
			'Conversion optimization roadmap',
			'Speed and conversion analysis',
			'Security check',
			'Competitive analysis',
			'Detailed action plan with clear next steps',
			'2-4 week delivery'
		],
		notIncluded: ['Development work', 'Ongoing maintenance'],
		popular: false,
		cta: 'Audit My Website',
		href: '/contact',
		roi: 'Clear action plan in 2-4 weeks'
	},
	{
		name: 'Business Website',
		price: 'Starting at $5,000',
		description:
			'A professional website built to bring in customers. Average 40% more leads within 90 days or we keep working for free.',
		features: [
			'Custom React/Next.js development',
			'Conversion-focused design',
			'Connects to your tools',
			'User authentication',
			'API development',
			'A/B testing infrastructure',
			'Analytics & tracking setup',
			'SEO optimization',
			'4-8 week delivery'
		],
		notIncluded: ['Complex integrations', 'E-commerce functionality'],
		popular: true,
		cta: 'Build My Website',
		href: '/contact',
		roi: '250% average ROI in 6 months'
	},
	{
		name: 'Business Automation Suite',
		price: 'Starting at $8,000',
		description:
			'Save 20+ hours/week and eliminate $50K+ in annual wasted time and overhead. Automation that grows when you do.',
		features: [
			'End-to-end process automation',
			'CRM/Email/Analytics integrations',
			'Custom workflow engines',
			'Advanced analytics dashboards',
			'Always reliable infrastructure',
			'Security & compliance',
			'Performance monitoring',
			'Training & documentation',
			'6-12 week delivery'
		],
		notIncluded: [],
		popular: false,
		cta: 'Automate My Business',
		href: '/contact',
		roi: '340% average ROI in first year'
	}
]

const faqs = [
	{
		question: 'Why do prices start at these amounts?',
		answer:
			'Our starting prices reflect the quality and expertise we bring to every project. We focus on delivering business value through custom solutions, not template-based work.'
	},
	{
		question: 'What factors affect the final project cost?',
		answer:
			'Project complexity, timeline requirements, third-party integrations, custom features, and ongoing maintenance needs all influence the final investment.'
	},
	{
		question: 'Do you offer payment plans?',
		answer:
			'Yes, we typically structure payments in milestones: 50% to start, 30% at midpoint, and 20% upon completion. Custom arrangements available for larger projects.'
	},
	{
		question: "What's included in the free consultation?",
		answer:
			'A 60-minute strategy session where we analyze your requirements, discuss technical options, and provide a detailed project estimate with timeline.'
	},
	{
		question: 'Do you provide ongoing support?',
		answer:
			'We offer various maintenance packages including bug fixes, security updates, feature enhancements, and technical support tailored to your needs.'
	}
]

export default function PricingPage() {
	return (
		<main className="min-h-screen bg-background">
			<JsonLd data={faqPageSchema} />

			{/* Hero Section */}
			<section className="relative overflow-hidden bg-background">
				<div className="container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
					<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
						Transparent Pricing
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Development That Pays for Itself
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
						Stop paying for websites that sit on a shelf. Our pricing is
						designed around ROI—if you don&apos;t see measurable results within
						90 days, we keep working for free. No hidden fees. No surprises.
						Just revenue-driven results.
					</p>
				</div>
			</section>

			{/* Pricing Cards */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="grid md:grid-cols-3 gap-6">
						{pricingTiers.map(tier => (
							<Card
								key={tier.name}
								variant="pricing"
								name={tier.name}
								price={tier.price}
								description={tier.description}
								features={tier.features}
								notIncluded={tier.notIncluded}
								popular={tier.popular}
								cta={tier.cta}
								href={tier.href}
								roi={tier.roi}
							/>
						))}
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							Common Questions
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							Frequently Asked Questions
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Everything you need to know about our pricing and process
						</p>
					</div>

					<div className="space-y-4 max-w-4xl mx-auto">
						{faqs.map((faq, index) => (
							<div
								key={index}
								className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors"
							>
								<h3 className="text-h3 text-foreground mb-3 text-balance">
									{faq.question}
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{faq.answer}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<section className="py-section px-4 sm:px-6">
				<div className="container-wide">
					<div className="relative overflow-hidden rounded-2xl border border-border bg-surface-raised p-10 md:p-16 text-center">
						<div
							className="hero-spotlight absolute inset-0 opacity-60 pointer-events-none"
							aria-hidden="true"
						/>
						<div className="relative z-10">
							<h2 className="text-section-title text-foreground mb-6 max-w-3xl mx-auto text-balance">
								Ready to Get More from Your Website?
							</h2>

							<p className="text-lead text-muted-foreground mb-4 max-w-2xl mx-auto">
								Get a free 30-minute strategy call showing exactly where your
								website is losing customers—and how to bring more in.
							</p>
							<p className="text-accent font-semibold mb-10">
								No sales pitch. No commitment. Just a clear action plan you can
								use immediately (even if you never hire us).
							</p>

							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<Button
									asChild
									variant="accent"
									size="xl"
									trackConversion={true}
								>
									<Link href="/contact">Claim Your Free Strategy Call</Link>
								</Button>

								<Button
									asChild
									variant="outline"
									size="xl"
									className="border-2 border-foreground/25 hover:border-accent dark:border-foreground/20"
								>
									<Link href="/showcase">See $3.7M+ in Proven Results</Link>
								</Button>
							</div>

							{/* Trust signals */}
							<div className="mt-10 pt-8 border-t border-border/40">
								<div className="flex flex-col md:flex-row justify-center items-center gap-6 text-xs text-muted-foreground">
									<div>90-day ROI guarantee</div>
									<div className="hidden md:block w-px h-4 bg-border" />
									<div>Response within 2 hours</div>
									<div className="hidden md:block w-px h-4 bg-border" />
									<div>50+ successful projects</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
