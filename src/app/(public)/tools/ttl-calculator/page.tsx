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

export const metadata: Metadata = {
	alternates: { canonical: '/tools/ttl-calculator' },
	title: 'Texas TTL Calculator | Hudson Digital Solutions',
	description:
		'Calculate tax, title, license fees and monthly payments for vehicles in Texas. Free online calculator for car buyers and dealers.',
	openGraph: {
		title: 'Texas TTL Calculator',
		description:
			'Calculate tax, title, license fees and monthly payments for vehicles in Texas.'
	}
}

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
