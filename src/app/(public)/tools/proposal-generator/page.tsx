/**
 * Proposal Generator
 * Create professional project proposals with PDF download
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import ProposalGeneratorClient from './ProposalGeneratorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Proposal Generator | Hudson Digital',
	description:
		'Create a project proposal and download it as a PDF. Add scope, milestones, pricing and terms. A free proposal generator for freelancers and agencies.',
	path: '/tools/proposal-generator',
	socialTitle: 'Proposal Generator',
	socialDescription: 'Create professional project proposals with PDF download.'
})

export default function ProposalGeneratorPage() {
	return <ProposalGeneratorClient />
}
