/**
 * Text statistics for the Word & Character Counter.
 *
 * Character counts use UTF-16 length (`String.length`) to match what
 * textarea `maxlength`, Twitter/X, and meta-description limits count, so
 * the number lines up with the limits people check against.
 */

export interface TextStats {
	words: number
	/** Characters including spaces (UTF-16 length). */
	characters: number
	/** Characters excluding any whitespace. */
	charactersNoSpaces: number
	sentences: number
	paragraphs: number
	lines: number
	/** Whole minutes at 200 words/min, rounded up. 0 for empty text. */
	readingTimeMinutes: number
}

const WORDS_PER_MINUTE = 200

const EMPTY: TextStats = {
	words: 0,
	characters: 0,
	charactersNoSpaces: 0,
	sentences: 0,
	paragraphs: 0,
	lines: 0,
	readingTimeMinutes: 0
}

export function analyzeText(text: string): TextStats {
	if (typeof text !== 'string' || text.length === 0) {
		return { ...EMPTY }
	}

	const characters = text.length
	const charactersNoSpaces = text.replace(/\s/g, '').length

	const trimmed = text.trim()
	if (trimmed.length === 0) {
		// Whitespace-only: it has characters and lines but no words/sentences.
		return {
			...EMPTY,
			characters,
			charactersNoSpaces,
			lines: text.split('\n').length
		}
	}

	const words = trimmed.split(/\s+/u).filter(Boolean).length

	// Sentence-ending punctuation groups followed by a space or end of text.
	// Falls back to 1 for text that has no terminal punctuation at all.
	const sentenceMatches = trimmed.match(/[.!?]+(?=["')\]’”]*(?:\s|$))/g)
	const sentences = sentenceMatches ? sentenceMatches.length : 1

	// Paragraphs are blocks separated by one or more blank lines.
	const paragraphs = trimmed
		.split(/\n\s*\n/)
		.filter(p => p.trim().length > 0).length

	const lines = text.split('\n').length

	const readingTimeMinutes = Math.ceil(words / WORDS_PER_MINUTE)

	return {
		words,
		characters,
		charactersNoSpaces,
		sentences,
		paragraphs,
		lines,
		readingTimeMinutes
	}
}
