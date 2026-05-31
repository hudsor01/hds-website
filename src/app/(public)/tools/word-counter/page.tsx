/**
 * Word & Character Counter
 */

import type { Metadata } from 'next'
import WordCounterClient from './WordCounterClient'

export const metadata: Metadata = {
	title: 'Word & Character Counter | Hudson Digital Solutions',
	description:
		'Free word and character counter. Live counts of words, characters, sentences, paragraphs, and reading time, perfect for meta descriptions, tweets, and content limits.'
}

export default function WordCounterPage() {
	return <WordCounterClient />
}
