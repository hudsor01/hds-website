import { describe, expect, test } from 'bun:test'
import { analyzeText } from '@/lib/text-stats'

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
			lines: 0,
			readingTimeMinutes: 0
		})
	})

	test('whitespace-only has characters and lines but no words', () => {
		const s = analyzeText('  \n  ')
		expect(s.words).toBe(0)
		expect(s.sentences).toBe(0)
		expect(s.characters).toBe(5)
		expect(s.lines).toBe(2)
	})

	test('counts sentences', () => {
		expect(analyzeText('One. Two! Three?').sentences).toBe(3)
	})

	test('groups repeated terminators as one sentence', () => {
		expect(analyzeText('Wait... really?!').sentences).toBe(2)
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

	test('counts paragraphs split by blank lines', () => {
		expect(analyzeText('Para one.\n\nPara two.\n\nPara three.').paragraphs).toBe(
			3
		)
	})

	test('counts lines', () => {
		expect(analyzeText('a\nb\nc').lines).toBe(3)
	})

	test('reading time rounds up at 200 wpm', () => {
		const text = Array.from({ length: 201 }, () => 'word').join(' ')
		expect(analyzeText(text).readingTimeMinutes).toBe(2)
		expect(analyzeText('one word here').readingTimeMinutes).toBe(1)
	})

	test('character count is the UTF-16 length (matches textarea limits)', () => {
		// 'h','i',' ' = 3, plus the rocket emoji which is a surrogate pair
		// (length 2) = 5 total, matching what textarea maxlength counts.
		expect(analyzeText('hi 🚀').characters).toBe(5)
	})
})
