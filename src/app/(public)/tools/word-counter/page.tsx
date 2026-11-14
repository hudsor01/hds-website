/**
 * Word & Character Counter
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import WordCounterClient from './WordCounterClient'

export const metadata: Metadata = buildMetadata({
	title: 'Word & Character Counter | Hudson Digital Solutions',
	description:
		'Free word and character counter. Live counts of words, characters, sentences, paragraphs, and reading time for meta descriptions, tweets, and content limits.',
	path: '/tools/word-counter'
})

export default function WordCounterPage() {
	return <WordCounterClient />
}
