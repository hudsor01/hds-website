import { ArrowRight, Check, HelpCircle, Phone, Zap } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { JsonLd } from '@/components/utilities/JsonLd'
import { BUSINESS_INFO } from '@/lib/constants/business'
import { ROUTES } from '@/lib/constants/routes'
import { SEO_CONFIG } from '@/utils/seo'

export const metadata: Metadata = {
	title:
		SEO_CONFIG.pricing?.title ||
		'Transparent Website Pricing | Hudson Digital Solutions',
	description:
		SEO_CONFIG.pricing?.description ||
		'Clear, upfront pricing for professional websites and business automation.',
	keywords: SEO_CONFIG.pricing?.keywords || [],
	openGraph: {
		title:
			SEO_CONFIG.pricing?.ogTitle ??
			SEO_CONFIG.pricing?.title ??
			'Website Pricing | Hudson Digital Solutions',
		description:
			SEO_CONFIG.pricing?.ogDescription ??
			SEO_CONFIG.pricing?.description ??
			'Transparent pricing for small business websites.',
		url: SEO_CONFIG.pricing?.canonical || ''
	},
	alternates: {
		canonical: SEO_CONFIG.pricing?.canonical || ''
	},
	robots: {
		index: true,
		follow: true,
		'max-snippet': -1,
		'max-image-preview': 'large',
		'max-video-preview': -1
	}
}

interface PricingTier {
	name: string
	price: string
	description: string
	features: string[]
	cta: string
	popular?: boolean
}

const tiers: PricingTier[] = [
	{
		name: 'Starter',
		price: '$497',
		description:
			'A professional single-page website that gets your business online and ranking on Google.',
		features: [
			'Custom single-page website',
			'Mobile-responsive design',
			'Contact form with email notifications',
			'Google Business Profile setup',
			'Basic on-page SEO',
			'SSL certificate included',
			'2 rounds of revisions',
			'Delivered in 1-2 weeks'
		],
		cta: 'Get Started'
	},
	{
		name: 'Professional',
		price: '$997',
		description:
			'A multi-page website with lead capture, local SEO, and the tools to turn visitors into customers.',
		features: [
			'Up to 5 custom pages',
			'Lead capture forms with CRM integration',
			'Local SEO optimization for DFW',
			'Google Analytics setup',
			'Social media integration',
			'Blog-ready architecture',
			'Speed-optimized (90+ PageSpeed)',
			'3 rounds of revisions',
			'Delivered in 2-3 weeks'
		],
		cta: 'Get Started',
		popular: true
	},
	{
		name: 'Premium',
		price: '$1,997',
		description:
			'A full business system: website, automation, and tool integrations that run your operations while you focus on customers.',
		features: [
			'Everything in Professional',
			'Up to 10 custom pages',
			'Business automation workflows',
			'CRM + email marketing integration',
			'Appointment scheduling system',
			'Invoice/payment integration',
			'Custom admin dashboard',
			'Priority support for 30 days',
			'Delivered in 3-4 weeks'
		],
		cta: 'Go Premium'
	}
]

interface AddOn {
	name: string
	price: string
	description: string
}

const addOns: AddOn[] = [
	{
		name: 'Monthly Maintenance',
		price: '$97/mo',
		description:
			'Hosting, security updates, backups, uptime monitoring, and up to 2 content changes per month.'
	},
	{
		name: 'SEO Growth Package',
		price: '$197/mo',
		description:
			'Monthly blog content, keyword tracking, Google Business Profile management, and local citation building.'
	},
	{
		name: 'Automation Add-On',
		price: 'From $297',
		description:
			'Custom workflow automation for follow-ups, onboarding sequences, invoice reminders, and more.'
	}
]

interface FAQ {
	question: string
	answer: string
}

const faqs: FAQ[] = [
	{
		question: 'Why not just use Wix or Squarespace?',
		answer:
			'Template builders work for basic sites, but they limit your SEO, load slowly, and lock you into their platform. A custom site loads faster, ranks higher, and you own it completely. For businesses that depend on local search traffic, the difference in Google rankings alone pays for the investment.'
	},
	{
		question: 'Do I own my website?',
		answer:
			'Yes, 100%. You own the code, the design, the content, and the domain. If you ever want to move, everything is yours. No vendor lock-in, no hostage situations.'
	},
	{
		question: 'What if I already have a site on another platform?',
		answer:
			'We handle the full migration. We transfer your domain, recreate your content on a faster platform, and make sure your Google rankings are preserved. Most clients see improved search visibility within 30 days of switching.'
	},
	{
		question: 'How long before I see results?',
		answer:
			'Your site goes live in 1-4 weeks depending on the package. SEO improvements typically show within 30-90 days. Automation ROI is immediate — the hours you save start from day one.'
	},
	{
		question: 'What happens after the site is built?',
		answer:
			'You can manage it yourself (we provide training) or sign up for our monthly maintenance plan. Either way, the site is yours and works independently. No monthly fee required to keep it running.'
	},
	{
		question: 'Do you offer payment plans?',
		answer:
			'Yes. We offer 50/50 split (half upfront, half on delivery) for all packages. For Premium, we also offer three monthly payments. No interest, no credit checks.'
	}
]

const faqSchema = {
	'@context': 'https://schema.org',
	'@type': 'FAQPage',
	mainEntity: faqs.map(faq => ({
		'@type': 'Question',
		name: faq.question,
		acceptedAnswer: {
			'@type': 'Answer',
			text: faq.answer
		}
	}))
}

export default function PricingPage() {
	return (
		<main className="min-h-screen bg-background">
			{SEO_CONFIG.pricing?.structuredData && (
				<JsonLd
					data={SEO_CONFIG.pricing.structuredData as Record<string, unknown>}
				/>
			)}
			<JsonLd data={faqSchema} />

			{/* Hero */}
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
						Transparent Pricing
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Website Pricing for DFW Small Businesses
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6 mb-10">
						No hourly billing. No hidden fees. No surprises. Pick the package
						that fits your business, and know exactly what you&apos;re paying
						before we start.
					</p>
				</div>
			</section>

			{/* Pricing Tiers */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="grid md:grid-cols-3 gap-6 items-stretch">
						{tiers.map(tier => (
							<div
								key={tier.name}
								className={`flex flex-col p-8 rounded-xl border transition-colors ${
									tier.popular
										? 'border-accent bg-accent/5 ring-1 ring-accent/20'
										: 'border-border bg-surface-raised hover:border-border-strong'
								}`}
							>
								{tier.popular && (
									<div className="flex items-center gap-1.5 mb-4">
										<Zap className="w-3.5 h-3.5 text-accent" />
										<span className="text-xs font-semibold uppercase tracking-widest text-accent">
											Most Popular
										</span>
									</div>
								)}

								<h2 className="text-h3 text-foreground">{tier.name}</h2>

								<div className="mt-4 mb-2">
									<span className="text-4xl font-black text-foreground tabular-nums">
										{tier.price}
									</span>
									<span className="text-sm text-muted-foreground ml-1">
										one-time
									</span>
								</div>

								<p className="text-sm text-muted-foreground leading-relaxed mb-6">
									{tier.description}
								</p>

								<ul className="space-y-3 mb-8 flex-1" role="list">
									{tier.features.map(feature => (
										<li
											key={feature}
											className="flex items-start gap-2.5 text-sm"
										>
											<Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
											<span className="text-foreground">{feature}</span>
										</li>
									))}
								</ul>

								<Button
									asChild
									variant={tier.popular ? 'accent' : 'outline'}
									size="lg"
									trackConversion={true}
									className={
										tier.popular
											? ''
											: 'border-2 border-foreground/25 hover:border-accent dark:border-foreground/20'
									}
								>
									<Link href={ROUTES.CONTACT}>
										{tier.cta}
										<ArrowRight className="w-4 h-4" />
									</Link>
								</Button>
							</div>
						))}
					</div>

					<p className="text-center text-sm text-muted-foreground mt-8">
						All packages include a free 30-minute strategy call. Payment plans
						available on all tiers.
					</p>
				</div>
			</section>

			{/* Add-Ons */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							Ongoing Support
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							Optional Add-Ons
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Your site works independently after delivery. These are optional
							for businesses that want ongoing growth.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-6">
						{addOns.map(addOn => (
							<div
								key={addOn.name}
								className="p-8 rounded-xl border border-border bg-surface-raised hover:border-border-strong transition-colors"
							>
								<h3 className="text-h3 text-foreground mb-2">{addOn.name}</h3>
								<div className="text-2xl font-black text-accent mb-4 tabular-nums">
									{addOn.price}
								</div>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{addOn.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide max-w-3xl">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							Common Questions
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							Pricing FAQ
						</h2>
					</div>

					<div className="space-y-6">
						{faqs.map(faq => (
							<div
								key={faq.question}
								className="p-6 rounded-xl border border-border bg-surface-raised"
							>
								<div className="flex items-start gap-3">
									<HelpCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
									<div>
										<h3 className="text-sm font-semibold text-foreground mb-2">
											{faq.question}
										</h3>
										<p className="text-sm text-muted-foreground leading-relaxed">
											{faq.answer}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-section px-4 sm:px-6">
				<div className="container-wide">
					<div className="relative overflow-hidden rounded-2xl border border-border bg-surface-raised p-10 md:p-16 text-center">
						<div
							className="hero-spotlight absolute inset-0 opacity-60 pointer-events-none"
							aria-hidden="true"
						/>
						<div className="relative z-10">
							<h2 className="text-section-title text-foreground mb-6 max-w-3xl mx-auto text-balance">
								Not sure which package fits?{' '}
								<span className="text-accent">Let&apos;s talk.</span>
							</h2>

							<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
								Every business is different. Book a free 30-minute call and
								we&apos;ll recommend the right package based on your goals, not
								upsell you on features you don&apos;t need.
							</p>

							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<Button
									asChild
									variant="accent"
									size="xl"
									trackConversion={true}
								>
									<Link href={ROUTES.CONTACT}>
										Book a Free Strategy Call
										<ArrowRight className="w-5 h-5" />
									</Link>
								</Button>

								{BUSINESS_INFO.phone && (
									<Button
										asChild
										variant="outline"
										size="xl"
										className="border-2 border-foreground/25 hover:border-accent dark:border-foreground/20"
									>
										<a href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}>
											<Phone className="w-5 h-5" />
											{BUSINESS_INFO.phone}
										</a>
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
