'use client'

/**
 * ProcessSteps
 *
 * Client component for the 4-step process section on the Services page.
 * Icon component references (functions) live here so ServicesPage can remain
 * a Server Component and export metadata.
 */

import { ClipboardList, Rocket, Search, Zap } from 'lucide-react'

const PROCESS_STEPS = [
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

export function ProcessSteps() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{PROCESS_STEPS.map((step, index) => (
				<div
					key={index}
					className="group rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors text-center"
				>
					<div className="mb-4 flex justify-center">
						<div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
							<step.icon className="w-5 h-5 text-accent" />
						</div>
					</div>
					<div className="text-accent font-bold text-sm mb-2 uppercase tracking-widest">
						{step.step}
					</div>
					<h3 className="text-h3 text-foreground mb-3 group-hover:text-accent transition-colors">
						{step.title}
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						{step.description}
					</p>
				</div>
			))}
		</div>
	)
}
