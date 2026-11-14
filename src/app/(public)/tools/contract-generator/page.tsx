/**
 * Contract Generator
 * Create professional contracts with PDF download
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import ContractGeneratorClient from './ContractGeneratorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Contract Generator | Hudson Digital Solutions',
	description:
		'Create professional contracts with PDF download. Free contract generator with customizable clauses, terms, and legal templates.',
	path: '/tools/contract-generator',
	socialTitle: 'Contract Generator',
	socialDescription: 'Create professional contracts with PDF download.'
})

export default function ContractGeneratorPage() {
	return <ContractGeneratorClient />
}
