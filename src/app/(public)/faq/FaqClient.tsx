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
import { FAQ_CATEGORIES as faqs } from '@/lib/constants/faqs'

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
					className="absolute inset-0 grid-pattern pointer-events-none"
					aria-hidden="true"
				/>
				<div
					className="hero-spotlight absolute inset-0 pointer-events-none"
					aria-hidden="true"
				/>
				<div className="relative z-10 container-wide pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
					<p className="text-eyebrow mb-3">FAQ</p>
					<h1 className="text-page-title text-foreground text-balance">
						Frequently Asked <span className="text-accent-text">Questions</span>
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
			<section className="py-section-sm">
				<div className="container-content">
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
												className="rounded-xl bg-card border-none"
											>
												{/* The item does not clip (no overflow-hidden), so the
												    trigger's focus outline stays visible; the trigger
												    takes the card radius so its hover fill fits. */}
												<AccordionTrigger className="rounded-xl px-6 py-4 text-left hover:bg-muted/30 hover:no-underline data-[state=open]:rounded-b-none">
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
			<section className="py-section">
				<div className="container-wide">
					<div className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 md:p-16 text-center">
						<div
							className="hero-spotlight absolute inset-0 opacity-60 pointer-events-none"
							aria-hidden="true"
						/>
						<div className="relative z-10">
							<h2 className="text-h1 text-foreground mb-6 max-w-3xl mx-auto text-balance">
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
