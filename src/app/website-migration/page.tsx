import {
	AlertTriangle,
	ArrowRight,
	Check,
	Clock,
	Globe,
	Phone,
	Shield,
	Zap
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { JsonLd } from '@/components/utilities/JsonLd'
import { BUSINESS_INFO } from '@/lib/constants/business'
import { ROUTES } from '@/lib/constants/routes'

export const metadata: Metadata = {
	title:
		'Website Migration Service - Switch Platforms Without Losing Rankings | Hudson Digital Solutions',
	description:
		"Stuck on an overpriced website platform you don't own? We migrate your website, recover your domain, and build you a faster site that's 100% yours. Free migration consultation.",
	keywords:
		'website migration, switch website platform, website transfer service, move my website, website platform migration, domain transfer help, small business website migration',
	openGraph: {
		title: 'Website Migration - Keep Your Rankings, Lose the Fees',
		description:
			'We migrate your website to a platform you own. No contracts, no monthly hostage fees.',
		url: 'https://hudsondigitalsolutions.com/website-migration'
	},
	alternates: {
		canonical: 'https://hudsondigitalsolutions.com/website-migration'
	},
	robots: {
		index: true,
		follow: true,
		'max-snippet': -1,
		'max-image-preview': 'large',
		'max-video-preview': -1
	}
}

const risks = [
	{
		Icon: Globe,
		title: 'Your Website Can Go Dark Overnight',
		description:
			"Many managed website platforms delete your site within 30 days of cancellation. No export option, no backup. If you haven't planned ahead, your online presence vanishes."
	},
	{
		Icon: Shield,
		title: 'Your Domain May Not Be Yours',
		description:
			'Some providers register your domain under their own account. Getting it transferred can take weeks of back-and-forth — or worse, they hold it hostage.'
	},
	{
		Icon: AlertTriangle,
		title: 'Your Google Rankings Are at Risk',
		description:
			"A botched migration can tank your Google Business Profile and search rankings. If URLs change without proper redirects, you lose the SEO equity you've built over years."
	}
]

interface MigrationStep {
	step: string
	title: string
	description: string
}

const migrationSteps: MigrationStep[] = [
	{
		step: '01',
		title: 'Free Migration Audit',
		description:
			'We review your current setup — website, domain ownership, Google Business Profile, CRM data — and create a migration plan with zero downtime.'
	},
	{
		step: '02',
		title: 'Domain Recovery',
		description:
			'We handle the domain transfer process with your current provider on your behalf. If your domain is locked, we know the exact steps to get it released.'
	},
	{
		step: '03',
		title: 'Website Rebuild',
		description:
			'Your new website goes live on a platform you own. Faster, mobile-optimized, and built to rank on Google. We preserve your existing content and improve it.'
	},
	{
		step: '04',
		title: 'SEO Preservation',
		description:
			'We set up proper redirects, submit updated sitemaps, and verify your Google Business Profile stays connected. Your rankings are protected throughout the switch.'
	}
]

const comparisons = [
	{
		feature: 'Monthly cost',
		managed: '$200-$1,500/mo',
		hudson: '$0-$97/mo'
	},
	{
		feature: 'Own your website',
		managed: 'No — provider owns it',
		hudson: 'Yes — 100% yours'
	},
	{
		feature: 'Own your domain',
		managed: 'Often held by provider',
		hudson: 'Registered in your name'
	},
	{
		feature: 'Contract required',
		managed: '6-12 month minimum',
		hudson: 'No contracts'
	},
	{
		feature: 'Page load speed',
		managed: '4-8 seconds typical',
		hudson: 'Under 2 seconds'
	},
	{
		feature: 'Custom design',
		managed: 'Template-based',
		hudson: 'Built for your business'
	},
	{
		feature: 'Cancel anytime',
		managed: 'Site deleted after cancellation',
		hudson: 'Your site stays live forever'
	}
]

export default function WebsiteMigrationPage() {
	const faqSchema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: [
			{
				'@type': 'Question',
				name: 'How long does a website migration take?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'Most migrations are complete in 1-2 weeks. Your new site goes live before we touch anything on the old platform, so there is zero downtime.'
				}
			},
			{
				'@type': 'Question',
				name: 'Will I lose my Google rankings?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'No. We set up proper 301 redirects, update your Google Business Profile, and submit fresh sitemaps. Most clients see improved rankings within 30 days because the new site loads faster.'
				}
			},
			{
				'@type': 'Question',
				name: "What if my provider won't release my domain?",
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'We handle the domain transfer process directly with your provider. If they delay, we know the ICANN dispute process and have helped multiple clients recover their domains.'
				}
			}
		]
	}

	return (
		<main className="min-h-screen bg-background">
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
						Website Migration
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Switch Website Platforms Without Losing Your Domain, Rankings, or
						Customers
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6 mb-10">
						Stuck paying hundreds a month for a website you don&apos;t own? We
						migrate everything to a faster site that&apos;s 100% yours — with
						zero downtime and preserved SEO rankings.
					</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button asChild variant="accent" size="xl" trackConversion={true}>
							<Link href={ROUTES.CONTACT}>
								Free Migration Consultation
								<ArrowRight className="w-4 h-4" />
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
									<Phone className="w-4 h-4" />
									{BUSINESS_INFO.phone}
								</a>
							</Button>
						)}
					</div>
				</div>
			</section>

			{/* What's at Risk */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							What&apos;s at Stake
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							What Happens When You Leave Your Provider Without a Plan
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Managed website platforms make it easy to sign up and hard to
							leave. Here&apos;s what most business owners don&apos;t realize
							until it&apos;s too late.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-6">
						{risks.map(risk => (
							<div
								key={risk.title}
								className="p-8 rounded-xl border border-border bg-surface-raised"
							>
								<div className="w-12 h-12 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-6">
									<risk.Icon className="w-5 h-5 text-destructive" />
								</div>
								<h3 className="text-h3 text-foreground mb-3">{risk.title}</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{risk.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Comparison Table */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide max-w-3xl">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							Side by Side
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							Managed Platforms vs. Owning Your Website
						</h2>
					</div>

					<div className="rounded-xl border border-border overflow-hidden">
						{/* Header */}
						<div className="grid grid-cols-3 bg-surface-raised border-b border-border">
							<div className="px-6 py-4 text-sm font-semibold text-muted-foreground">
								Feature
							</div>
							<div className="px-6 py-4 text-sm font-semibold text-muted-foreground text-center">
								Managed Platform
							</div>
							<div className="px-6 py-4 text-sm font-semibold text-accent text-center">
								Hudson Digital
							</div>
						</div>

						{/* Rows */}
						{comparisons.map((row, index) => (
							<div
								key={row.feature}
								className={`grid grid-cols-3 border-b border-border last:border-0 ${
									index % 2 === 0 ? 'bg-background' : 'bg-surface-raised/50'
								}`}
							>
								<div className="px-6 py-4 text-sm font-medium text-foreground">
									{row.feature}
								</div>
								<div className="px-6 py-4 text-sm text-muted-foreground text-center">
									{row.managed}
								</div>
								<div className="px-6 py-4 text-sm text-foreground font-medium text-center">
									{row.hudson}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Migration Process */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide max-w-3xl">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							How It Works
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							Your Migration in 4 Steps
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							We handle everything. You keep running your business.
						</p>
					</div>

					<div className="space-y-6">
						{migrationSteps.map(step => (
							<div
								key={step.step}
								className="flex gap-6 p-6 rounded-xl border border-border bg-surface-raised hover:border-border-strong transition-colors"
							>
								<div className="text-3xl font-black text-accent/30 tabular-nums shrink-0">
									{step.step}
								</div>
								<div>
									<h3 className="text-h3 text-foreground mb-2">{step.title}</h3>
									<p className="text-sm text-muted-foreground leading-relaxed">
										{step.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* What You Get */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide max-w-3xl">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							After Migration
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							What You Walk Away With
						</h2>
					</div>

					<div className="grid sm:grid-cols-2 gap-4">
						{[
							'A website you own — no monthly hostage fees',
							'Your domain registered in your name',
							'Google Business Profile connected and verified',
							'Page load under 2 seconds',
							'Mobile-optimized responsive design',
							'SEO rankings preserved or improved',
							'Contact forms that email you directly',
							'Analytics dashboard to track visitors',
							'Full training so you can update it yourself',
							'30 days of priority support after launch'
						].map(item => (
							<div key={item} className="flex items-start gap-3">
								<Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
								<span className="text-sm text-foreground">{item}</span>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Stats */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="grid sm:grid-cols-3 gap-px bg-border/30 rounded-2xl overflow-hidden">
						<div className="bg-background px-8 py-10 text-center relative overflow-hidden">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
							<div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
								<Clock className="w-5 h-5 text-accent" />
							</div>
							<div className="text-4xl font-black text-accent mb-2 tabular-nums">
								30 days
							</div>
							<div className="text-sm text-muted-foreground">
								Most platforms delete your site after cancellation
							</div>
						</div>
						<div className="bg-background px-8 py-10 text-center relative overflow-hidden">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
							<div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
								<Zap className="w-5 h-5 text-accent" />
							</div>
							<div className="text-4xl font-black text-accent mb-2 tabular-nums">
								1-2 wks
							</div>
							<div className="text-sm text-muted-foreground">
								Typical migration timeline with zero downtime
							</div>
						</div>
						<div className="bg-background px-8 py-10 text-center relative overflow-hidden">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
							<div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
								<Shield className="w-5 h-5 text-accent" />
							</div>
							<div className="text-4xl font-black text-accent mb-2 tabular-nums">
								$0/mo
							</div>
							<div className="text-sm text-muted-foreground">
								Required monthly fees after your site is built
							</div>
						</div>
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
								Ready to own your website{' '}
								<span className="text-accent">for real?</span>
							</h2>

							<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
								Book a free migration consultation. We&apos;ll audit your
								current setup, tell you exactly what it takes to switch, and
								give you a fixed quote with no surprises.
							</p>

							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<Button
									asChild
									variant="accent"
									size="xl"
									trackConversion={true}
								>
									<Link href={ROUTES.CONTACT}>
										Book Free Migration Audit
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
											Call {BUSINESS_INFO.phone}
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
