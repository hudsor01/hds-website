'use client'

/**
 * Calculator Layout Component
 * Provides consistent layout and structure for all calculator tools
 */

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

interface CalculatorLayoutProps {
	title: string
	description: string
	icon?: ReactNode
	children: ReactNode
	showBackLink?: boolean
}

export function CalculatorLayout({
	title,
	description,
	icon,
	children,
	showBackLink = true
}: CalculatorLayoutProps) {
	return (
		<main className="min-h-screen bg-background">
			<div className="container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 max-w-4xl mx-auto">
				{/* Header */}
				<div className="mb-10 text-center">
					{icon && (
						<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
							{icon}
						</div>
					)}

					<h1 className="mb-3 text-page-title text-foreground leading-tight">
						{title}
					</h1>

					<p className="mx-auto max-w-2xl text-lead text-muted-foreground">
						{description}
					</p>
				</div>

				{/* Calculator Content */}
				<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
					{children}
				</div>

				{/* Back Link */}
				{showBackLink && (
					<div className="mt-6 text-center">
						<Link
							href="/tools"
							className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition-colors"
						>
							← Back to Tools
						</Link>
					</div>
				)}

				{/* Trust Signals */}
				<div className="mt-12 border-t border-border pt-8">
					<div className="grid gap-px sm:grid-cols-3 bg-border/30 rounded-2xl overflow-hidden">
						<div className="bg-background px-8 py-8 text-center relative overflow-hidden">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
							<div className="text-2xl font-bold text-accent mb-1 tabular-nums">
								Growing
							</div>
							<div className="text-sm text-muted-foreground">
								Calculations Performed
							</div>
						</div>

						<div className="bg-background px-8 py-8 text-center relative overflow-hidden">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
							<div className="text-2xl font-bold text-accent mb-1 tabular-nums">
								98%
							</div>
							<div className="text-sm text-muted-foreground">Accuracy Rate</div>
						</div>

						<div className="bg-background px-8 py-8 text-center relative overflow-hidden">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
							<div className="text-2xl font-bold text-accent mb-1 tabular-nums">
								Free
							</div>
							<div className="text-sm text-muted-foreground">
								No Credit Card Required
							</div>
						</div>
					</div>

					<div className="text-center mt-6">
						<Link
							href="/contact"
							className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
						>
							Ready to act on these numbers? Get a free strategy call
							<ArrowRight className="w-4 h-4" />
						</Link>
					</div>
				</div>
			</div>
		</main>
	)
}
