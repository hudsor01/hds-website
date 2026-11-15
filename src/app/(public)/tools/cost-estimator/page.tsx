/**
 * Website Cost Estimator
 * Typical market cost range for a website project (a planning ballpark,
 * not a quote: Hudson Digital prices every project after scoping it)
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import { CostEstimatorClient } from './CostEstimatorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Website Cost Estimator | Hudson Digital Solutions',
	description:
		'See what a website like yours typically costs on the market, by type, pages, features and design. A planning ballpark for your budget, not a quote.',
	path: '/tools/cost-estimator',
	socialTitle: 'Website Cost Estimator',
	socialDescription:
		'See the typical market cost range for a website like yours. A planning ballpark, not a quote.'
})

export default function CostEstimatorPage() {
	return <CostEstimatorClient />
}
