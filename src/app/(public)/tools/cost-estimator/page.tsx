/**
 * Website Cost Estimator
 * Typical market cost range for a website project (a planning ballpark,
 * not a quote: Hudson Digital prices every project after scoping it)
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import { CostEstimatorClient } from './CostEstimatorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Website Cost Estimator and Price Calculator | Hudson Digital',
	description:
		'Free website cost calculator: get a website estimate by type, pages, features and design. It shows the typical market range for planning, not a quote.',
	path: '/tools/cost-estimator',
	socialTitle: 'Website Cost Estimator',
	socialDescription:
		'See the typical market cost range for a website like yours. A planning ballpark, not a quote.'
})

export default function CostEstimatorPage() {
	return <CostEstimatorClient />
}
