/**
 * Contract Generator
 * Create professional contracts with PDF download
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import ContractGeneratorClient from './ContractGeneratorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Contract Generator | Hudson Digital',
	description:
		'Create a service agreement, freelance contract or mutual NDA as a PDF. Plain-English templates you read in full before you sign. Not legal advice.',
	path: '/tools/contract-generator',
	socialTitle: 'Contract Generator',
	socialDescription: 'Create professional contracts with PDF download.'
})

export default function ContractGeneratorPage() {
	return <ContractGeneratorClient />
}
