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
		title: 'Website Design & Development',
		description:
			'A professional website built for your business from scratch: clean custom design, mobile-ready, and fast. Comes with an admin panel so you control your content without calling a developer.',
		features: [
			'Custom Design Built for Your Brand',
			'Mobile-Ready on Every Device',
			'Fast-Loading, Every Time',
			'Admin Panel You Control',
			'Contact & Inquiry Forms Built In'
		],
		icon: Code2,
		gradient: 'bg-muted'
	},
	{
		title: 'Get Found on Google',
		description:
			'A great website only works if customers can find it. We build in the SEO, speed, and local-search details that put your business in front of the people already searching for what you do.',
		features: [
			'Local SEO Setup',
			'Google Business Profile Optimization',
			'Fast Core Web Vitals',
			'Search-Ready Page Structure',
			'Indexed & Submitted to Google'
		],
		icon: BarChart3,
		gradient: 'bg-info/20'
	},
	{
		title: 'Booking, Payments & Follow-Up',
		description:
			'Once your site is live, we can wire in the extras: let customers book online, take payments, and make sure no inquiry slips through the cracks.',
		features: [
			'Online Booking & Scheduling',
			'Stripe Payment Setup',
			'Calendar Sync',
			'Automatic Lead Follow-Up',
			'CRM Connection'
		],
		icon: Settings,
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
				/>
			))}
		</div>
	)
}
