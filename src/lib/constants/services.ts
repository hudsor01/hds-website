/**
 * The three services sold on /services.
 *
 * Single source for the visible ServicesGrid cards, the per-service pages at
 * /services/[slug], the Service and FAQPage JSON-LD and the services section
 * of /llms.txt. `anchorId` is the card's in-page anchor on /services;
 * `slug` is the dedicated page.
 *
 * Copy rules: only facts the business stands behind (timelines, warranty,
 * maintenance, tools from the founder's revenue ops work). No prices: every
 * project is priced after the free website plan call.
 */

export interface ServiceDetail {
	title: string
	body: string
}

export interface ServiceFaq {
	question: string
	answer: string
}

export interface Service {
	anchorId: 'design-build' | 'seo' | 'booking'
	slug: 'web-design' | 'local-seo' | 'booking-payments'
	title: string
	/** schema.org `serviceType`: the plain category a search engine files it under. */
	serviceType: string
	description: string
	/** The H1 on the service page. */
	headline: string
	metaTitle: string
	metaDescription: string
	/** Question-form H2 over the overview, phrased the way people search. */
	overviewHeading: string
	overview: string[]
	/** What the service includes. The titles double as the card's checklist. */
	included: ServiceDetail[]
	faqs: ServiceFaq[]
	/** Blog tag whose posts the service page links to. */
	blogTag: string
}

export const SERVICES: readonly Service[] = [
	{
		anchorId: 'design-build',
		slug: 'web-design',
		title: 'Website Design & Development',
		serviceType: 'Web design',
		description:
			'A professional website built for your business from scratch: clean custom design, mobile-ready and fast. Comes with an admin panel so you control your content without calling a developer.',
		headline: 'Website Design for Dallas-Fort Worth Small Businesses',
		metaTitle: 'Small Business Web Design in DFW | Hudson Digital',
		metaDescription:
			'Custom website design for Dallas-Fort Worth small businesses: mobile-first, fast and built to bring in calls. Priced per project after a free plan call.',
		overviewHeading: 'What does a small business website need to do?',
		overview: [
			'It has to bring in work. I design and build custom websites for small businesses across Dallas-Fort Worth, built around the one thing the site exists for: getting a customer to call, book or buy. No template stretched to fit.',
			'A simple site usually takes 1 to 4 weeks. Add an online store or booking and it runs 8 to 12 weeks. Bigger builds with custom features take 3 to 6 months. I price every project after a free website plan call, once I know what it will take.'
		],
		included: [
			{
				title: 'Custom Design Built for Your Brand',
				body: 'Your colors, your photos, your voice. You sign off on the mockups before the build starts.'
			},
			{
				title: 'Mobile-Ready on Every Device',
				body: 'Most of your customers find you on a phone. I build mobile-first and test on real iOS and Android devices.'
			},
			{
				title: 'Fast-Loading, Every Time',
				body: 'Clean code and optimized images so pages load quickly on a phone signal. Speed keeps visitors from bouncing and helps you rank.'
			},
			{
				title: 'Admin Panel You Control',
				body: 'Change your hours, prices, photos and text yourself in minutes. No developer, no waiting, no invoice every time you tweak a line.'
			},
			{
				title: 'Contact & Inquiry Forms Built In',
				body: 'Every form reaches you the moment someone fills it out, so a lead does not sit in an inbox nobody checks.'
			}
		],
		faqs: [
			{
				question: 'How long does a small business website take?',
				answer:
					'A simple site runs 1 to 4 weeks. Add an online store or booking and it is 8 to 12 weeks. Bigger builds with custom features run 3 to 6 months. If you are on a deadline, I can put dedicated time on it and move faster.'
			},
			{
				question: 'How much does a website cost?',
				answer:
					'It depends on page count, features and timeline, so I do not quote a flat price. I give you a real price on a free 30-minute website plan call. For a rough planning range before we talk, try the free Website Cost Estimator.'
			},
			{
				question: 'Can I update the site myself?',
				answer:
					'Yes. Every site comes with an admin panel, so you change your hours, prices, photos and text without calling a developer.'
			},
			{
				question: 'What happens after launch?',
				answer:
					'You get a 30-day bug-fix warranty after launch. If you want the site handled after that, I offer monthly maintenance that covers updates, security patches, backups, monitoring and support.'
			}
		],
		blogTag: 'web-design'
	},
	{
		anchorId: 'seo',
		slug: 'local-seo',
		title: 'Get Found on Google',
		serviceType: 'Local search engine optimization',
		description:
			'A great website only works if customers can find it. I build in the SEO, speed and local-search details that put your business in front of the people already searching for what you do.',
		headline: 'Local SEO for Dallas-Fort Worth Businesses',
		metaTitle: 'Local SEO and Google Business Profile Setup | Hudson Digital',
		metaDescription:
			'Local SEO for Dallas-Fort Worth small businesses: Google Business Profile setup, fast pages and search-ready structure so nearby customers find you.',
		overviewHeading: 'How do local customers find your business?',
		overview: [
			'They search. When someone in Dallas-Fort Worth looks up what you do, local SEO decides whether your business shows up or your competitor does. A great website only works if people can find it.',
			'I build the search basics into every site: fast pages, clean structure, schema markup, a sitemap and a Google Business Profile set up the right way. For deep ongoing content and link building, I can point you to partners I trust.'
		],
		included: [
			{
				title: 'Local SEO Setup',
				body: 'Your city, service area and services written into the pages and the structured data search engines read, so Google knows where you work and what you do.'
			},
			{
				title: 'Google Business Profile Optimization',
				body: 'Categories, hours, services, photos and a link to the right page. Your profile is often the first thing a local customer sees, before your website.'
			},
			{
				title: 'Fast Core Web Vitals',
				body: 'Google measures how fast and stable your pages are. I build to pass those checks on mobile, where most local searches happen.'
			},
			{
				title: 'Search-Ready Page Structure',
				body: 'One clear topic per page, proper headings, meta tags and schema markup, so search engines and AI answer tools can understand your pages.'
			},
			{
				title: 'Indexed & Submitted to Google',
				body: 'I submit your sitemap in Google Search Console and check that your pages are actually indexed, not just published.'
			}
		],
		faqs: [
			{
				question: 'How long does local SEO take to work?',
				answer:
					'Search engines need time to crawl and trust a new or rebuilt site, so expect weeks to months, not days. Anyone promising page one by next week is guessing. I get the foundation right so you are not waiting on fixes later.'
			},
			{
				question: 'Is SEO included with a new website?',
				answer:
					'Yes. Every site I build is set up to be found: clean code, fast load times, meta tags, schema markup and a sitemap. Local SEO so DFW customers find you on Google is part of the work.'
			},
			{
				question: 'Do you do ongoing content or link building?',
				answer:
					'Not as a core service. For deep ongoing content and link building, I can point you to partners I trust.'
			},
			{
				question: 'Do I need a Google Business Profile?',
				answer:
					'If you serve customers in a local area, yes. It is free, it shows up in Google Maps and the local results and it is often where a customer decides to call. I set one up or clean up the one you have.'
			}
		],
		blogTag: 'seo'
	},
	{
		anchorId: 'booking',
		slug: 'booking-payments',
		title: 'Booking, Payments & Follow-Up',
		serviceType: 'Online booking and payment integration',
		description:
			'Once your site is live, I can wire in the extras: let customers book online, take payments and make sure no inquiry slips through the cracks.',
		headline: 'Online Booking, Payments and Lead Follow-Up',
		metaTitle: 'Booking and Payments for Small Business | Hudson Digital',
		metaDescription:
			'Online booking, Stripe payments, calendar sync and automatic lead follow-up for Dallas-Fort Worth small businesses, wired into your website and CRM.',
		overviewHeading: 'Why wire booking and payments into your website?',
		overview: [
			'So visits turn into revenue without you picking up the phone. Customers book a time, pay a deposit or the full amount and get a confirmation, day or night.',
			'I spent nearly a decade in revenue operations wiring up HubSpot, Salesforce, Stripe and Workato before I built websites. Connecting your booking tool, payment processor and CRM so no inquiry slips through the cracks is home turf.'
		],
		included: [
			{
				title: 'Online Booking & Scheduling',
				body: 'Customers pick a service and a time from your real availability instead of trading voicemails.'
			},
			{
				title: 'Stripe Payment Setup',
				body: 'Take deposits or full payments online through Stripe, with receipts sent automatically.'
			},
			{
				title: 'Calendar Sync',
				body: 'Bookings land on the calendar you already use, so you are not double booked.'
			},
			{
				title: 'Automatic Lead Follow-Up',
				body: 'Every form and booking triggers a confirmation and a follow-up, so a lead does not go cold while you are on a job.'
			},
			{
				title: 'CRM Connection',
				body: 'New leads flow into HubSpot or the CRM you use with their source attached, so you know which pages bring in work.'
			}
		],
		faqs: [
			{
				question: 'How long does it take to add booking or payments?',
				answer:
					'A new site with online booking or a store usually runs 8 to 12 weeks. If you already have a site, I scope the work on a free website plan call and give you a timeline there.'
			},
			{
				question: 'Which booking and payment tools do you work with?',
				answer:
					'Stripe for payments, plus the booking tool, calendar and CRM that fit your business. If it has a connection point, I can tie it into your site and your workflow.'
			},
			{
				question: 'Can you connect my website to my CRM?',
				answer:
					'Yes. Leads from your forms and bookings land in HubSpot, Salesforce or the CRM you use automatically instead of sitting in an inbox.'
			},
			{
				question: 'What does booking and payment setup cost?',
				answer:
					'It depends on which tools you need and how much automation fits your business, so I price it per project after a free website plan call. Payment processors like Stripe charge their own transaction fees.'
			}
		],
		blogTag: 'business-automation'
	}
]

export function getServiceBySlug(slug: string): Service | undefined {
	return SERVICES.find(service => service.slug === slug)
}

/**
 * Which service a blog post funnels to, by tag. Checked in the post's tag
 * order; posts with no mapped tag fall back to web design, since every post
 * is about running a small business website.
 */
const TAG_TO_SERVICE: Record<string, Service['slug']> = {
	'web-design': 'web-design',
	'web-development': 'web-design',
	'website-migration': 'web-design',
	'website-performance': 'web-design',
	seo: 'local-seo',
	'local-marketing': 'local-seo',
	'dallas-fort-worth': 'local-seo',
	'business-automation': 'booking-payments',
	'conversion-optimization': 'booking-payments'
}

export function getServiceForTags(tagSlugs: readonly string[]): Service {
	const slug =
		tagSlugs.map(tag => TAG_TO_SERVICE[tag]).find(Boolean) ?? 'web-design'
	const service = getServiceBySlug(slug)
	if (!service) {
		throw new Error(`TAG_TO_SERVICE points at unknown service "${slug}"`)
	}
	return service
}
