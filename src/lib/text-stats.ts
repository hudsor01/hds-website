/**
 * Text statistics for the Word & Character Counter.
 *
 * The site is English only, so counts follow English rules. Uses
 * `Intl.Segmenter` with the `en` locale (supported in every current
 * browser and in Bun or Node):
 * - Characters are grapheme clusters, what a reader sees as one character:
 *   an emoji, a flag or an accented letter counts once.
 * - Words are word-like segments, so a standalone dash or emoji is not a
 *   word. Parts joined by a hyphen (well-known) count as one word.
 * - Sentences follow sentence breaks, so a last sentence without a period
 *   counts. Common English abbreviations (Dr., e.g.) and initials do not
 *   end a sentence.
 *
 * A simpler regex fallback covers runtimes without `Intl.Segmenter`.
 */

export interface TextStats {
	words: number
	/** User-perceived characters (grapheme clusters), spaces included. */
	characters: number
	/** User-perceived characters, excluding whitespace. */
	charactersNoSpaces: number
	sentences: number
	paragraphs: number
	/** Whole minutes at READING_WORDS_PER_MINUTE, rounded up. 0 when empty. */
	readingTimeMinutes: number
}

/**
 * Average silent reading rate for English non-fiction: 238 words per
 * minute. Brysbaert, M. (2019). How many words do we read per minute? A
 * review and meta-analysis of reading rate. Journal of Memory and
 * Language, 109, 104047.
 */
export const READING_WORDS_PER_MINUTE = 238

const EMPTY: TextStats = {
	words: 0,
	characters: 0,
	charactersNoSpaces: 0,
	sentences: 0,
	paragraphs: 0,
	readingTimeMinutes: 0
}

const LOCALE = 'en'
const HAS_LETTER_OR_DIGIT = /[\p{L}\p{N}]/u
const WHITESPACE_ONLY = /^\s+$/u
const HYPHENS = new Set(['-', '\u2010', '\u2011'])

// Lowercased, without the trailing period. A sentence segment ending in
// one of these is not the end of a sentence.
const ABBREVIATIONS = new Set([
	'mr',
	'mrs',
	'ms',
	'dr',
	'prof',
	'sr',
	'jr',
	'st',
	'mt',
	'vs',
	'etc',
	'inc',
	'ltd',
	'co',
	'corp',
	'no',
	'approx',
	'dept',
	'est',
	'jan',
	'feb',
	'mar',
	'apr',
	'jun',
	'jul',
	'aug',
	'sep',
	'sept',
	'oct',
	'nov',
	'dec'
])

type SegmenterCtor = typeof Intl.Segmenter

function getSegmenter(): SegmenterCtor | null {
	return typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
		? Intl.Segmenter
		: null
}

export function analyzeText(text: string): TextStats {
	if (typeof text !== 'string' || text.length === 0) {
		return { ...EMPTY }
	}

	const Segmenter = getSegmenter()
	const graphemes = Segmenter
		? Array.from(
				new Segmenter(LOCALE, { granularity: 'grapheme' }).segment(text),
				s => s.segment
			)
		: Array.from(text)
	const characters = graphemes.length
	const charactersNoSpaces = graphemes.filter(
		g => !WHITESPACE_ONLY.test(g)
	).length

	if (text.trim().length === 0) {
		return { ...EMPTY, characters, charactersNoSpaces }
	}

	const words = Segmenter
		? countWords(text, Segmenter)
		: countWordsFallback(text)
	const sentences = Segmenter
		? countSentences(text, Segmenter)
		: countSentencesFallback(text)

	// Paragraphs are blocks separated by one or more blank lines.
	const paragraphs = text
		.trim()
		.split(/\n\s*\n/)
		.filter(p => p.trim().length > 0).length

	return {
		words,
		characters,
		charactersNoSpaces,
		sentences,
		paragraphs,
		readingTimeMinutes: Math.ceil(words / READING_WORDS_PER_MINUTE)
	}
}

function countWords(text: string, Segmenter: SegmenterCtor): number {
	let count = 0
	let previousWasWord = false
	let hyphenAfterWord = false
	for (const segment of new Segmenter(LOCALE, {
		granularity: 'word'
	}).segment(text)) {
		if (segment.isWordLike) {
			// "well-known" is one word, not two.
			if (!hyphenAfterWord) {
				count++
			}
			previousWasWord = true
			hyphenAfterWord = false
		} else {
			hyphenAfterWord = previousWasWord && HYPHENS.has(segment.segment)
			previousWasWord = false
		}
	}
	return count
}

function countSentences(text: string, Segmenter: SegmenterCtor): number {
	const segments = Array.from(
		new Segmenter(LOCALE, { granularity: 'sentence' }).segment(text),
		s => s.segment
	).filter(s => HAS_LETTER_OR_DIGIT.test(s))

	let count = 0
	segments.forEach((segment, index) => {
		const isLast = index === segments.length - 1
		if (isLast || !endsWithAbbreviation(segment)) {
			count++
		}
	})
	return count
}

/** True when a segment ends with "Dr.", "e.g.", an initial like "J." etc. */
function endsWithAbbreviation(segment: string): boolean {
	const lastToken = segment.trim().split(/\s+/).pop() ?? ''
	if (!lastToken.endsWith('.')) {
		return false
	}
	const word = lastToken.replace(/^[("'\u201C\u2018[]+/, '').slice(0, -1)
	if (ABBREVIATIONS.has(word.toLowerCase())) {
		return true
	}
	// Initials ("J.") and dotted forms ("e.g", "U.S").
	return /^\p{L}$/u.test(word) || /^(?:\p{L}\.)+\p{L}$/u.test(word)
}

function countWordsFallback(text: string): number {
	return text
		.trim()
		.split(/\s+/u)
		.filter(token => HAS_LETTER_OR_DIGIT.test(token)).length
}

function countSentencesFallback(text: string): number {
	return text
		.split(/(?<=[.!?]+["')\]\u2019\u201D]*)\s+/u)
		.filter(s => HAS_LETTER_OR_DIGIT.test(s)).length
}
