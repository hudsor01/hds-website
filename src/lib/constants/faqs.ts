/**
 * The questions on /faq. Single source for the visible accordion and the
 * page's FAQPage JSON-LD, so the structured data always matches what a
 * visitor can read (Google requires that).
 */

import type { ServiceFaq } from '@/lib/constants/services'

export interface FaqCategory {
	category: string
	questions: ServiceFaq[]
}

export const FAQ_CATEGORIES: readonly FaqCategory[] = [
	{
		category: 'Services',
		questions: [
			{
				question: 'What website design services do you offer?',
				answer:
					'I build websites for small businesses in Dallas-Fort Worth that bring in work: custom design, fast, mobile-first and built to show up on Google. Once your site is live, I wire in booking, payments and customer follow-up so the leads it generates turn into paying customers.'
			},
			{
				question: 'How much does it cost to build a website?',
				answer:
					'Every project is priced to what it actually takes: page count, features and timeline. I give you a real price on a free website plan call, once I know what your project needs. For a rough market ballpark before we talk, try the free Cost Estimator. No surprise line items later.'
			},
			{
				question: 'Do you offer monthly retainer packages?',
				answer:
					'Yes. I keep sites running with monthly retainers: updates, security patches, performance checks, new features and priority support. It is for owners who want the site handled without hiring someone in-house. Reach out and I will scope a package to what your business actually needs.'
			},
			{
				question: 'What is your typical project timeline?',
				answer:
					'Depends on scope. A simple site runs 1 to 4 weeks. Add online store or booking and it is 8 to 12 weeks. Bigger builds with custom features and payment setup run 3 to 6 months. If you are on a deadline, I can put dedicated time on it and move faster.'
			}
		]
	},
	{
		category: 'Process & Communication',
		questions: [
			{
				question: 'What is your development process?',
				answer:
					'Eight steps, no mystery: 1) a discovery call to learn your business and goals, 2) a detailed proposal with timeline and milestones, 3) design with mockups you sign off on, 4) the build with weekly progress updates, 5) testing and quality checks, 6) launch and go-live, 7) training and handoff, 8) ongoing support. You always know what is next.'
			},
			{
				question: 'How often will we communicate during the project?',
				answer:
					'You get a progress update every week by email or video call and a shared board so you can see exactly where things stand any time. Need me fast? Slack or email gets a reply within 2 hours during business hours.'
			},
			{
				question: 'Can I make changes to the project after it starts?',
				answer:
					'Yes. Plans change once you see the work taking shape. Small tweaks are part of the scope. Anything big enough to move the timeline or budget gets talked through and approved before I touch it. I build in room for that from the start.'
			},
			{
				question: 'Do you sign NDAs?',
				answer:
					'Yes. Send your NDA and I will sign it before we get into anything confidential. Your ideas and your business stay yours.'
			}
		]
	},
	{
		category: 'Technical Questions',
		questions: [
			{
				question: 'What technologies do you use?',
				answer:
					'I use modern, proven tools picked for speed and reliability, not because they are trendy. The exact stack depends on what fits your business. You do not need to know what is under the hood. You need it to load fast, work right and never embarrass you in front of a customer.'
			},
			{
				question: 'Will my website be mobile-friendly?',
				answer:
					'Yes. Every site I build is mobile-first and fully responsive. I test on real iOS and Android devices, not on a single browser tab. Most of your customers will find you on a phone. Google ranks on mobile first too, so this is not optional.'
			},
			{
				question: 'Do you provide SEO services?',
				answer:
					'Every site I build is set up to be found: clean code, fast load times, proper meta tags, schema markup and a sitemap. Local SEO so DFW customers find you on Google is part of the work. For deep ongoing content and link building, I can point you to partners I trust.'
			},
			{
				question: 'Can you integrate with my existing systems?',
				answer:
					'Yes. I spent nearly a decade in revenue operations wiring up HubSpot, Salesforce, Stripe and Workato before I built sites, so connecting tools is home turf. Booking system, email platform, payment processor: if it has a connection point, I can tie it into your site and your workflow.'
			},
			{
				question: 'Do you provide hosting and maintenance?',
				answer:
					'Yes. I can set you up on the host you prefer or recommend one that fits. And I offer maintenance packages that cover updates, security patches, backups, monitoring and support, so the site keeps running while you run the business.'
			}
		]
	},
	{
		category: 'Getting Started',
		questions: [
			{
				question: 'How do I get started?',
				answer:
					'Book a free 30-minute website plan call. We talk through your business, your customers and what the site has to do for you. After that I send a detailed plan with exact pricing and deliverables. No pressure, no canned pitch.'
			},
			{
				question: 'Do you work with new businesses?',
				answer:
					'Yes, plenty of them. I get the tight budgets, the fast timelines and the need for early wins. I help new businesses get the foundation right on day one so you are not paying to rip it out and redo it in a year.'
			},
			{
				question: 'What payment terms do you offer?',
				answer:
					'On fixed-price projects I usually split it 50% up front, 25% at the midpoint and 25% at completion. Retainers are billed monthly. I take bank transfers, credit cards and PayPal.'
			},
			{
				question: 'Do you offer guarantees?',
				answer:
					'Yes. I stand behind what is in the proposal. If something does not work the way I promised, I fix it at no extra cost and you get a 30-day bug-fix warranty after launch on top of that.'
			}
		]
	}
]
