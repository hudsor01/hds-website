'use client'

import {
	ArrowRight,
	BarChart3,
	ClipboardList,
	Code2,
	Rocket,
	Search,
	Settings,
	Zap
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Service {
	title: string
	description: string
	features: string[]
	pricing: string
	icon: React.ComponentType<{ className?: string }>
	gradient: string
}

const services: Service[] = [
	{
		title: 'Website Development',
		description:
			'Build your digital front door. Custom websites with admin panels so you control your content, mobile-ready and built to convert visitors into customers.',
		features: [
			'Custom Design & Build',
			'Admin Panel So You Control Content',
			'Works With Your Data',
			'Fast-Loading, Every Time',
			'Always Reliable, Always Available'
		],
		pricing: 'Starting at $5,000',
		icon: Code2,
		gradient: 'bg-muted'
	},
	{
		title: 'Integrations & Connections',
		description:
			'We link your website to every tool your business runs on — CRM, payments, calendar, email. Data flows automatically, nothing falls through the cracks.',
		features: [
			'HubSpot CRM Connection',
			'Stripe Payment Setup',
			'Calendar & Booking Systems',
			'Email Platform Sync',
			'Outdated Systems Upgraded'
		],
		pricing: 'Starting at $8,000',
		icon: Settings,
		gradient: 'bg-info/20'
	},
	{
		title: 'Business Automation',
		description:
			'Follow-up emails, onboarding sequences, appointment reminders, invoice chasing. We automate the workflows that eat your time so your business runs without you.',
		features: [
			'HubSpot Workflow Automation',
			'Zapier & n8n Integrations',
			'Automated Follow-Up Sequences',
			'Appointment & Reminder Flows',
			'Invoice & Payment Chasing'
		],
		pricing: 'Starting at $2,000',
		icon: BarChart3,
		gradient: 'bg-muted'
	}
]

interface Stat {
	value: string
	label: string
}

const stats: Stat[] = [
	{ value: 'Fast', label: 'Delivery Timeline' },
	{ value: 'Expert', label: 'Development Team' },
	{ value: 'Proven', label: 'ROI Results' },
	{ value: '24/7', label: 'Support Available' }
]

interface ProcessStep {
	step: string
	title: string
	description: string
	icon: React.ComponentType<{ className?: string }>
}

const process: ProcessStep[] = [
	{
		step: '01',
		title: 'Discovery',
		description:
			'We learn how your business works today — what you do manually, what tools you use, and where time is being lost.',
		icon: Search
	},
	{
		step: '02',
		title: 'Strategy',
		description:
			'We map out exactly what to build, connect, or automate — with clear timelines and a plain-English plan you can follow.',
		icon: ClipboardList
	},
	{
		step: '03',
		title: 'Development',
		description:
			'We build your solution quickly and reliably so you can launch with confidence.',
		icon: Zap
	},
	{
		step: '04',
		title: 'Launch',
		description:
			'We go live, make sure everything works, and stay available so nothing catches you off guard.',
		icon: Rocket
	}
]

export default function ServicesPage() {
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
						Professional Services
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Everything Your Business Needs Online
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6 mb-10">
						From your first website to full business automation — we handle it
						all so you don&apos;t have to.
					</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button asChild variant="accent" size="xl" trackConversion={true}>
							<Link href="/contact">
								Start Your Project
								<ArrowRight className="w-4 h-4" />
							</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							size="xl"
							className="border-2 border-foreground/25 hover:border-accent dark:border-foreground/20"
						>
							<Link href="#process">See Our Process</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Services Section */}
			<section id="services-list" className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							What We Build
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							Services That Grow Your Business
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							We handle the tech. You focus on running your business.
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{services.map((service, index) => (
							<Card
								key={index}
								variant="service"
								title={service.title}
								description={service.description}
								features={service.features}
								icon={service.icon}
								gradient={service.gradient}
								pricing={service.pricing}
							/>
						))}
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							Track Record
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							Proven Results
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Small business owners trust us to get it done right and on time —
							without the technical runaround.
						</p>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/30 rounded-2xl overflow-hidden">
						{stats.map((stat, index) => (
							<div
								key={index}
								className="bg-background px-8 py-10 text-center relative overflow-hidden"
							>
								<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
								<div className="text-4xl font-black text-accent mb-2 tabular-nums">
									{stat.value}
								</div>
								<div className="text-sm text-muted-foreground">
									{stat.label}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Process Section */}
			<section id="process" className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							How It Works
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							Our Process
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Simple, clear steps from first conversation to live and working —
							no technical jargon required.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{process.map((step, index) => (
							<div
								key={index}
								className="group rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors text-center"
							>
								<div className="mb-4 flex justify-center">
									<div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
										<step.icon className="w-5 h-5 text-accent" />
									</div>
								</div>
								<div className="text-accent font-bold text-sm mb-2 uppercase tracking-widest">
									{step.step}
								</div>
								<h3 className="text-h3 text-foreground mb-3 group-hover:text-accent transition-colors">
									{step.title}
								</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{step.description}
								</p>
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
								Ready to stop doing it{' '}
								<span className="text-accent">manually?</span>
							</h2>

							<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
								Tell us what&apos;s taking up your time. We&apos;ll put together
								a plan to build, connect, or automate it — and give you back
								your day.
							</p>

							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<Button
									asChild
									variant="accent"
									size="xl"
									trackConversion={true}
								>
									<Link href="/contact">
										Start Your Project
										<ArrowRight className="w-5 h-5" />
									</Link>
								</Button>

								<Button
									asChild
									variant="outline"
									size="xl"
									className="border-2 border-foreground/25 hover:border-accent dark:border-foreground/20"
								>
									<Link href="#services-list">Explore Services</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
