/**
 * Website Cost Estimator
 * Illustrative planning model for a website budget, shown beside Clutch's
 * published market ranges (not market data and not a quote: Hudson Digital
 * prices every project after scoping it)
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import { CostEstimatorClient } from './CostEstimatorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Website Cost Estimator and Calculator | Hudson Digital',
	description:
		'Free website cost calculator: an illustrative planning range by type, pages, features and design, beside published market ranges. Not a quote.',
	path: '/tools/cost-estimator',
	socialTitle: 'Website Cost Estimator',
	socialDescription:
		'An illustrative planning range for a website like yours, with published market ranges for context. Not a quote.'
})

export default function CostEstimatorPage() {
	return <CostEstimatorClient />
}
