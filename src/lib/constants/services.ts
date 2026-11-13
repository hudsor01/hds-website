/**
 * The three services sold on /services.
 *
 * Single source for the visible ServicesGrid cards, the Service JSON-LD on
 * /services and the services section of /llms.txt. `anchorId` is the
 * in-page anchor the Footer's "Solutions" links target
 * (`/services#design-build`, `#seo`, `#booking`), so changing one is a
 * link change too.
 */

export interface Service {
	anchorId: 'design-build' | 'seo' | 'booking'
	title: string
	/** schema.org `serviceType`: the plain category a search engine files it under. */
	serviceType: string
	description: string
	features: string[]
}

export const SERVICES: readonly Service[] = [
	{
		anchorId: 'design-build',
		title: 'Website Design & Development',
		serviceType: 'Web design',
		description:
			'A professional website built for your business from scratch: clean custom design, mobile-ready and fast. Comes with an admin panel so you control your content without calling a developer.',
		features: [
			'Custom Design Built for Your Brand',
			'Mobile-Ready on Every Device',
			'Fast-Loading, Every Time',
			'Admin Panel You Control',
			'Contact & Inquiry Forms Built In'
		]
	},
	{
		anchorId: 'seo',
		title: 'Get Found on Google',
		serviceType: 'Local search engine optimization',
		description:
			'A great website only works if customers can find it. I build in the SEO, speed and local-search details that put your business in front of the people already searching for what you do.',
		features: [
			'Local SEO Setup',
			'Google Business Profile Optimization',
			'Fast Core Web Vitals',
			'Search-Ready Page Structure',
			'Indexed & Submitted to Google'
		]
	},
	{
		anchorId: 'booking',
		title: 'Booking, Payments & Follow-Up',
		serviceType: 'Online booking and payment integration',
		description:
			'Once your site is live, I can wire in the extras: let customers book online, take payments and make sure no inquiry slips through the cracks.',
		features: [
			'Online Booking & Scheduling',
			'Stripe Payment Setup',
			'Calendar Sync',
			'Automatic Lead Follow-Up',
			'CRM Connection'
		]
	}
]
