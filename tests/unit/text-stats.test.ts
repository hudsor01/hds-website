import { describe, expect, test } from 'bun:test'
import { analyzeText, READING_WORDS_PER_MINUTE } from '@/lib/text-stats'

describe('analyzeText', () => {
	test('counts words and characters', () => {
		const s = analyzeText('hello world')
		expect(s.words).toBe(2)
		expect(s.characters).toBe(11)
		expect(s.charactersNoSpaces).toBe(10)
	})

	test('collapses multiple spaces for word count', () => {
		expect(analyzeText('a   b\t c').words).toBe(3)
	})

	test('empty string is all zeroes', () => {
		expect(analyzeText('')).toEqual({
			words: 0,
			characters: 0,
			charactersNoSpaces: 0,
			sentences: 0,
			paragraphs: 0,
			readingTimeMinutes: 0
		})
	})

	test('whitespace-only has characters but no words or sentences', () => {
		const s = analyzeText('  \n  ')
		expect(s.words).toBe(0)
		expect(s.sentences).toBe(0)
		expect(s.characters).toBe(5)
		expect(s.charactersNoSpaces).toBe(0)
	})

	test('counts sentences', () => {
		expect(analyzeText('One. Two! Three?').sentences).toBe(3)
	})

	test('a last sentence without a period still counts', () => {
		expect(analyzeText('Hello world. This is a test').sentences).toBe(2)
	})

	test('groups repeated terminators as one sentence', () => {
		expect(analyzeText('Wait... Really?!').sentences).toBe(2)
		// An ellipsis followed by lowercase continues the sentence.
		expect(analyzeText('Wait... really?!').sentences).toBe(1)
	})

	test('text with no terminator counts as one sentence', () => {
		expect(analyzeText('just a fragment').sentences).toBe(1)
	})

	test('counts a sentence ending in a closing quote', () => {
		expect(analyzeText('He said "Stop." Now go.').sentences).toBe(2)
	})

	test('counts a sentence ending in a closing paren', () => {
		expect(analyzeText('This (done.) Next one.').sentences).toBe(2)
	})

	test('abbreviations and initials do not end a sentence', () => {
		expect(analyzeText('Dr. Smith met Mr. Jones. They talked.').sentences).toBe(
			2
		)
		expect(analyzeText('J. R. Smith wrote it. It sold.').sentences).toBe(2)
		expect(
			analyzeText('Bring tools, e.g. a hammer. Then start.').sentences
		).toBe(2)
	})

	test('CJK full stops end sentences', () => {
		expect(analyzeText('今日は晴れです。明日は雨です。').sentences).toBe(2)
	})

	test('unspaced CJK text is split into words, not counted as one', () => {
		expect(analyzeText('我喜欢编程').words).toBeGreaterThan(1)
	})

	test('a standalone dash is not a word', () => {
		expect(analyzeText('Fast — and cheap').words).toBe(3)
		expect(analyzeText('wait - what').words).toBe(2)
	})

	test('hyphenated compounds count as one word', () => {
		expect(analyzeText('a well-known fact').words).toBe(3)
	})

	test('contractions count as one word', () => {
		expect(analyzeText("don't stop").words).toBe(2)
	})

	test('an emoji is one character, and a family emoji is too', () => {
		expect(analyzeText('hi 🚀').characters).toBe(4)
		expect(analyzeText('👨‍👩‍👧').characters).toBe(1)
		expect(analyzeText('🚀').words).toBe(0)
	})

	test('counts paragraphs split by blank lines', () => {
		expect(
			analyzeText('Para one.\n\nPara two.\n\nPara three.').paragraphs
		).toBe(3)
	})

	test('reading time rounds up at 238 words per minute (Brysbaert, 2019)', () => {
		expect(READING_WORDS_PER_MINUTE).toBe(238)
		const words = (n: number) =>
			Array.from({ length: n }, () => 'word').join(' ')
		expect(analyzeText(words(238)).readingTimeMinutes).toBe(1)
		expect(analyzeText(words(239)).readingTimeMinutes).toBe(2)
		expect(analyzeText('one word here').readingTimeMinutes).toBe(1)
	})
})

describe('analyzeText without Intl.Segmenter (fallback)', () => {
	test('still counts the last sentence, CJK words and stops', () => {
		const original = Intl.Segmenter
		Object.defineProperty(Intl, 'Segmenter', {
			value: undefined,
			configurable: true,
			writable: true
		})
		try {
			expect(analyzeText('Hello world. This is a test').sentences).toBe(2)
			expect(analyzeText('今日は晴れです。明日は雨です。').sentences).toBe(2)
			expect(analyzeText('我喜欢编程').words).toBe(5)
			expect(analyzeText('Fast - and cheap').words).toBe(3)
			expect(analyzeText('hello world').characters).toBe(11)
		} finally {
			Object.defineProperty(Intl, 'Segmenter', {
				value: original,
				configurable: true,
				writable: true
			})
		}
	})
})
