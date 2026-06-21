'use client'

import { ArrowRight, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const faqs = [
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
					'Every project is priced to what you actually need, so it comes down to page count, features and timeline. The fastest way to a real number is our free Cost Estimator tool or a free website plan call. I will walk you through options that fit your budget. No surprise line items later.'
			},
			{
				question: 'Do you offer monthly retainer packages?',
				answer:
					'Yes. I keep sites running with monthly retainers: updates, security patches, performance checks, new features and priority support. It is for owners who want the site handled without hiring someone in-house. Reach out and I will scope a package to what your business actually needs.'
			},
			{
				question: 'What is your typical project timeline?',
				answer:
					'Depends on scope. A simple site runs 4 to 6 weeks. Add online store or booking and it is 8 to 12 weeks. Bigger builds with custom features and payment setup run 3 to 6 months. If you are on a deadline, I can put dedicated time on it and move faster.'
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
					'Yes. I spent about ten years in revenue operations wiring up HubSpot, Salesforce, Stripe and Workato before I built sites, so connecting tools is home turf. Booking system, email platform, payment processor: if it has a connection point, I can tie it into your site and your workflow.'
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

export default function FaqClient() {
	const [searchQuery, setSearchQuery] = useState('')

	// Filter FAQs based on search query
	const filteredFaqs = searchQuery
		? faqs
				.map(category => ({
					...category,
					questions: category.questions.filter(
						q =>
							q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
							q.answer.toLowerCase().includes(searchQuery.toLowerCase())
					)
				}))
				.filter(category => category.questions.length > 0)
		: faqs

	return (
		<div className="min-h-screen bg-background">
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
						FAQ
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Frequently Asked <span className="text-accent">Questions</span>
					</h1>

					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6 mb-8">
						Straight answers about working with me: websites, pricing, process
						and timelines.
					</p>

					{/* Search */}
					<div className="max-w-2xl mx-auto">
						<div className="relative">
							<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
							<Input
								type="text"
								placeholder="Search FAQs..."
								aria-label="Search FAQs"
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								className="pl-12"
							/>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ Categories */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide max-w-4xl mx-auto">
					{filteredFaqs.length === 0 ? (
						<div className="text-center py-12" aria-live="polite" role="status">
							<p className="text-sm text-muted-foreground leading-relaxed">
								No results found for &quot;{searchQuery}&quot;
							</p>
						</div>
					) : (
						<div className="space-y-12">
							{filteredFaqs.map((category, catIndex) => (
								<div key={catIndex}>
									<h2 className="text-h3 text-foreground mb-6">
										{category.category}
									</h2>

									<Accordion type="single" collapsible className="space-y-3">
										{category.questions.map((faq, qIndex) => (
											<AccordionItem
												key={qIndex}
												value={`${catIndex}-${qIndex}`}
												className="rounded-xl border border-border bg-surface-raised overflow-hidden border-none"
											>
												<AccordionTrigger className="px-6 py-4 text-left hover:bg-muted/30 hover:no-underline">
													<span className="text-base font-semibold text-foreground pr-8">
														{faq.question}
													</span>
												</AccordionTrigger>
												<AccordionContent className="px-6 pb-6">
													<p className="text-sm text-muted-foreground leading-relaxed">
														{faq.answer}
													</p>
												</AccordionContent>
											</AccordionItem>
										))}
									</Accordion>
								</div>
							))}
						</div>
					)}
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
								Still Have Questions?
							</h2>
							<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
								Get a free website plan. I&apos;ll map out exactly what your
								site needs and answer every question you have along the way.
							</p>
							<Button asChild variant="accent" size="xl">
								<Link href="/contact">
									Get My Free Website Plan
									<ArrowRight className="w-4 h-4" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}
