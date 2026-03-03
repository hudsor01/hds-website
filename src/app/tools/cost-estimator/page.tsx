/**
 * Website Cost Estimator
 * Get instant project cost estimates based on requirements and features
 */

import { Calculator } from 'lucide-react'
import type { Metadata } from 'next'
import { CalculatorLayout } from '@/components/calculators/CalculatorLayout'
import { CostEstimatorClient } from './CostEstimatorClient'

export const metadata: Metadata = {
	title: 'Website Cost Estimator | Hudson Digital Solutions',
	description:
		'Get an instant estimate for your website project based on your specific requirements, features, and design complexity.',
	openGraph: {
		title: 'Website Cost Estimator',
		description:
			'Get instant project cost estimates based on requirements and features.'
	}
}

export default function CostEstimatorPage() {
	return (
		<CalculatorLayout
			title="Website Cost Estimator"
			description="Get an instant estimate for your website project based on your specific requirements and features"
			icon={<Calculator className="h-8 w-8 text-accent" />}
		>
			<CostEstimatorClient />
		</CalculatorLayout>
	)
}
