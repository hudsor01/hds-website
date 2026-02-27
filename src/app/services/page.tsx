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
import { BackgroundPattern } from '@/components/ui/BackgroundPattern'
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
			<section className="relative min-h-screen flex-center overflow-hidden">
				{/* Background Elements */}
				<BackgroundPattern variant="default" />

				<div className="relative z-sticky container-wide sm:px-6 lg:px-8 text-center">
					<div className="space-y-sections">
						<div>
							<span className="inline-flex items-center gap-tight px-4 py-2 rounded-full border border-accent/30 bg-accent/10 text-accent font-semibold text-responsive-sm backdrop-blur-sm">
								Professional Services
							</span>
						</div>

						<div>
							<h1 className="text-responsive-lg font-black text-foreground leading-none tracking-tight text-balance">
								<span className="inline-block">Everything Your</span>
								<span className="inline-block mx-4 text-accent">Business</span>
								<span className="inline-block">Needs</span>
								<span className="inline-block ml-4 text-accent">Online</span>
							</h1>
						</div>

						<div className="typography">
							<p className="large text-muted-foreground container-wide leading-relaxed text-pretty">
								From your first website to full business automation — we handle
								it all so you don&apos;t have to.
							</p>
						</div>

						<div>
							<div className="flex-center flex-col sm:flex-row gap-content mt-12">
								<Button
									asChild
									variant="default"
									size="lg"
									trackConversion={true}
								>
									<Link href="/contact">
										Start Your Project
										<ArrowRight className="w-4 h-4" />
									</Link>
								</Button>

								<Button
									asChild
									variant="outline"
									size="lg"
									trackConversion={true}
								>
									<Link href="#process">
										See Our Process
										<ArrowRight className="w-4 h-4" />
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>
			{/* Services Section */}
			<section id="services-list" className="relative py-section px-4">
				<div className="container-wide">
					<div className="text-center mb-16">
						<h2 className="text-lg font-black text-foreground mb-content-block">
							<span className="text-accent">
								Services That Grow Your Business
							</span>
						</h2>
						<div className="typography">
							<p className="large muted container-narrow">
								We handle the tech. You focus on running your business.
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-sections mb-16">
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
			<section className="relative py-section px-4">
				<div className="container-wide">
					<div className="text-center mb-16">
						<h2 className="text-lg font-black text-foreground mb-content-block">
							<span className="text-accent">Proven Results</span>
						</h2>
						<div className="typography">
							<p className="large muted container-narrow">
								Small business owners trust us to get it done right and on time
								— without the technical runaround.
							</p>
						</div>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-comfortable mb-16">
						{stats.map((stat, index) => (
							<Card
								key={index}
								variant="glassLight"
								size="lg"
								hover
								className="relative text-center"
							>
								<div className="text-h1 text-foreground mb-subheading">
									{stat.value}
								</div>
								<div className="small muted">{stat.label}</div>
							</Card>
						))}
					</div>
				</div>
			</section>
			{/* Process Section */}
			<section id="process" className="relative py-section px-4">
				<div className="container-wide">
					<div className="text-center mb-16">
						<h2 className="text-lg font-black text-foreground mb-content-block">
							<span className="text-accent">Our Process</span>
						</h2>
						<div className="typography">
							<p className="large text-muted-foreground container-narrow">
								Simple, clear steps from first conversation to live and working
								— no technical jargon required.
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-sections mb-16">
						{process.map((step, index) => (
							<Card
								key={index}
								variant="glass"
								size="lg"
								hover
								className="group relative text-center"
							>
								<div className="mb-heading flex justify-center">
									<div className="w-16 h-16 bg-accent/20 rounded-full flex-center">
										<step.icon className="w-8 h-8 text-accent" />
									</div>
								</div>
								<div className="text-accent font-bold text-lg mb-subheading">
									{step.step}
								</div>
								<h3 className="text-xl font-bold text-foreground mb-heading group-hover:text-accent transition-colors">
									{step.title}
								</h3>
								<div className="typography">
									<p className="muted group-hover:text-muted-foreground transition-colors">
										{step.description}
									</p>
								</div>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="relative py-section px-4">
				<div className="container-wide">
					<Card
						variant="glassSection"
						size="none"
						className="relative z-sticky text-center p-12 md:p-16"
					>
						<h2 className="text-lg font-black text-foreground mb-content-block">
							Ready to stop doing it
							<span className="text-accent"> manually?</span>
						</h2>

						<div className="typography">
							<p className="large muted container-narrow mb-10">
								Tell us what&apos;s taking up your time. We&apos;ll put together
								a plan to build, connect, or automate it — and give you back
								your day.
							</p>
						</div>

						<div className="flex flex-col sm:flex-row flex-center gap-content">
							<Button
								asChild
								variant="default"
								size="xl"
								trackConversion={true}
							>
								<Link href="/contact">
									Start Your Project
									<ArrowRight className="w-5 h-5" />
								</Link>
							</Button>

							<Button asChild variant="outline" size="xl">
								<Link href="#services-list">
									Explore Services
									<ArrowRight className="w-5 h-5" />
								</Link>
							</Button>
						</div>
					</Card>
				</div>
			</section>
		</main>
	)
}
