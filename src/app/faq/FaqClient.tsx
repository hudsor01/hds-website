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
		category: 'Services & Pricing',
		questions: [
			{
				question: 'What web development services do you offer?',
				answer:
					'We build websites that convert visitors into customers, connect your business tools so data flows automatically, and automate the workflows that cost you time. Think: your website, your CRM, your calendar, your payment processor — all working together without manual effort.'
			},
			{
				question: 'How much does it cost to build a website?',
				answer:
					'Website costs vary based on complexity. A simple business website starts at $5,000-$10,000. E-commerce sites range from $15,000-$50,000. Custom web applications start at $50,000+. Use our free Cost Estimator tool for a personalized quote based on your specific requirements.'
			},
			{
				question: 'Do you offer monthly retainer packages?',
				answer:
					'Yes. We offer ongoing maintenance and support retainers starting at $2,500/month. This includes regular updates, security patches, performance monitoring, feature additions, and priority support. Perfect for businesses that need continuous support without hiring in-house.'
			},
			{
				question: 'What is your typical project timeline?',
				answer:
					'Timelines depend on project scope. Simple websites take 4-6 weeks. E-commerce and booking-enabled sites take 8-12 weeks. Projects with custom integrations and automation typically take 3-6 months. We can expedite urgent projects with dedicated resources.'
			}
		]
	},
	{
		category: 'Process & Communication',
		questions: [
			{
				question: 'What is your development process?',
				answer:
					'Our process includes: 1) Discovery call to understand your business and goals, 2) Detailed proposal with timeline and milestones, 3) Design phase with mockups for approval, 4) Build phase with weekly progress updates, 5) Testing and quality checks, 6) Launch and go-live, 7) Training and handoff, 8) Ongoing support and maintenance.'
			},
			{
				question: 'How often will we communicate during the project?',
				answer:
					"We provide weekly progress updates via email or video call. You'll have access to a shared project management board to track progress in real-time. For urgent matters, we're available via Slack or email within 24 hours."
			},
			{
				question: 'Can I make changes to the project after it starts?',
				answer:
					'Yes, we understand requirements evolve. Minor changes are included in the project scope. Major changes that affect timeline or budget will be discussed and approved before implementation. We plan for flexibility from the start.'
			},
			{
				question: 'Do you sign NDAs?',
				answer:
					"Absolutely. We're happy to sign your NDA before discussing confidential project details. We take intellectual property and confidentiality very seriously."
			}
		]
	},
	{
		category: 'Technical Questions',
		questions: [
			{
				question: 'What technologies do you use?',
				answer:
					"We use modern, proven tools chosen for reliability and speed — not because they're trendy. The specific technology depends on what works best for your business. You don't need to know what's under the hood; you just need it to work."
			},
			{
				question: 'Will my website be mobile-friendly?',
				answer:
					'Yes, all our websites are fully responsive and mobile-first. We test on actual devices (iOS and Android) to ensure perfect functionality across all screen sizes. Mobile-friendliness is essential for SEO and user experience.'
			},
			{
				question: 'Do you provide SEO services?',
				answer:
					'We build SEO-friendly websites with clean code, fast loading times, proper meta tags, schema markup, and sitemap generation. For ongoing SEO, content strategy, and link building, we can recommend trusted SEO partners.'
			},
			{
				question: 'Can you integrate with my existing systems?',
				answer:
					'Yes. We connect whatever tools your business already uses — HubSpot, Salesforce, Stripe, your booking system, your email platform. If it has a connection point, we can link it to your website and your workflows.'
			},
			{
				question: 'Do you provide hosting and maintenance?',
				answer:
					'We can set up hosting on your preferred platform or recommend one that fits your needs. We offer maintenance packages that include updates, security patches, backups, monitoring, and technical support.'
			}
		]
	},
	{
		category: 'Getting Started',
		questions: [
			{
				question: 'How do I get started?',
				answer:
					"Schedule a free 30-minute consultation call. We'll discuss your business goals, what's working, what isn't, and where automation or a better website could make the biggest difference. After the call, we'll send a detailed proposal with exact pricing and deliverables."
			},
			{
				question: 'Do you work with new businesses?',
				answer:
					"Absolutely. We understand fast timelines, tight budgets, and the need for quick wins. We help new businesses get their digital foundation right from day one — so you're not paying to redo it later."
			},
			{
				question: 'What payment terms do you offer?',
				answer:
					'For fixed-price projects, we typically split payments: 50% upfront, 25% at midpoint, 25% at completion. For retainers, we bill monthly. We accept bank transfers, credit cards, and PayPal.'
			},
			{
				question: 'Do you offer guarantees?',
				answer:
					"Yes. We guarantee our work meets the specifications outlined in the proposal. If something doesn't work as promised, we'll fix it at no additional cost. We also offer a 30-day bug-fix warranty after launch."
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
		<main className="min-h-screen bg-background">
			{/* Hero */}
			<section className="relative overflow-hidden bg-background">
				<div className="container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
					<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
						FAQ
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Frequently Asked <span className="text-accent">Questions</span>
					</h1>

					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6 mb-8">
						Everything you need to know about working with us — websites,
						integrations, automation, process, and pricing.
					</p>

					{/* Search */}
					<div className="max-w-2xl mx-auto">
						<div className="relative">
							<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
							<Input
								type="text"
								placeholder="Search FAQs..."
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
								Schedule a free consultation call and we&apos;ll answer all your
								questions about your project.
							</p>
							<Button asChild variant="accent" size="xl" trackConversion={true}>
								<Link href="/contact">
									Schedule Free Consultation
									<ArrowRight className="w-4 h-4" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
