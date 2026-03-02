'use client'

/**
 * ServicesGrid
 *
 * Client component wrapper for the services cards. Keeps icon component
 * references (functions) on the client side, allowing the ServicesPage to
 * remain a Server Component and export metadata.
 */

import { BarChart3, Code2, Settings } from 'lucide-react'
import { Card } from '@/components/ui/card'

const SERVICES = [
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

export function ServicesGrid() {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			{SERVICES.map((service, index) => (
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
	)
}
