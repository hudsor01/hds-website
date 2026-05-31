/**
 * Website Cost Estimator
 * Get instant project cost estimates based on requirements and features
 */

import type { Metadata } from 'next'
import { CostEstimatorClient } from './CostEstimatorClient'

export const metadata: Metadata = {
	alternates: { canonical: '/tools/cost-estimator' },
	title: 'Website Cost Estimator | Hudson Digital Solutions',
	description:
		'Get an instant estimate for your website project based on your requirements, features, and design complexity, so you can plan and budget with confidence.',
	openGraph: {
		title: 'Website Cost Estimator',
		description:
			'Get instant project cost estimates based on requirements and features.'
	}
}

export default function CostEstimatorPage() {
	return <CostEstimatorClient />
}
