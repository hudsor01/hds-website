/**
 * Texas TTL Calculator
 * Calculate vehicle tax, title, license fees and monthly payments.
 *
 * The JSON-LD WebApplication schema lives at this server-component layer
 * so it can read the per-request CSP nonce via JsonLd. Previously it was
 * emitted from the inner client component, which can't access headers().
 */

import type { Metadata } from 'next'
import { Calculator } from '@/components/calculators/Calculator'
import { JsonLd } from '@/components/utilities/JsonLd'
import { brandedTitle, buildMetadata } from '@/lib/seo-config'
import { TEXAS_SALES_TAX_RATE } from '@/lib/ttl-calculator/calculator'

export const metadata: Metadata = buildMetadata({
	title: brandedTitle('Texas TTL Calculator: Tax, Title and License'),
	description: `Free Texas TTL calculator for car buyers and dealers. Estimate the ${TEXAS_SALES_TAX_RATE * 100}% sales tax, title, registration and county fees, plus a monthly payment.`,
	path: '/tools/ttl-calculator',
	socialTitle: 'Texas TTL Calculator',
	socialDescription:
		'Calculate tax, title, license fees and monthly payments for vehicles in Texas.'
})

const ttlCalculatorSchema = {
	'@context': 'https://schema.org',
	'@type': 'WebApplication',
	name: 'Texas TTL Calculator',
	description:
		'Calculate tax, title, license fees and monthly payments for vehicles in Texas',
	applicationCategory: 'FinanceApplication',
	operatingSystem: 'All',
	offers: {
		'@type': 'Offer',
		price: '0',
		priceCurrency: 'USD'
	}
}

export default function TTLCalculatorPage() {
	return (
		<>
			<JsonLd data={ttlCalculatorSchema} />
			<Calculator />
		</>
	)
}
