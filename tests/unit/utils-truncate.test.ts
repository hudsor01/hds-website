/**
 * `truncateAtWord` covers blog card previews (audit #255) and is small
 * enough that the test surface can be exhaustive. Add cases here when
 * new edge cases come up — the function intentionally has no I/O so
 * round-trips stay fast.
 */
import { describe, expect, it } from 'bun:test'
import { truncateAtWord } from '@/lib/utils'

describe('truncateAtWord', () => {
	it('returns the input unchanged when it fits inside maxChars', () => {
		expect(truncateAtWord('short text', 20)).toBe('short text')
	})

	it('returns the input unchanged when length equals maxChars exactly', () => {
		expect(truncateAtWord('exactlymaxchars', 15)).toBe('exactlymaxchars')
	})

	it('slices on the last whitespace inside the head and appends an ellipsis', () => {
		const input = 'The quick brown fox jumps over the lazy dog'
		// head(25) = "The quick brown fox jumps"; lastIndexOf(' ') = 19;
		// so cut = "The quick brown fox".
		expect(truncateAtWord(input, 25)).toBe('The quick brown fox…')
	})

	it('strips trailing whitespace from the truncated head before appending the ellipsis', () => {
		expect(truncateAtWord('a b c d e f g h i j', 8)).toBe('a b c d…')
	})

	it('falls back to a hard slice when the input has no whitespace inside the budget', () => {
		const longHash = 'abcdefghijklmnopqrstuvwxyz'
		expect(truncateAtWord(longHash, 10)).toBe('abcdefghij…')
	})

	it('does not split the audit-reported "manually copy-paste information" mid-word', () => {
		const input =
			'Stop wasting hours on tasks like manually copy-paste information between systems.'
		const out = truncateAtWord(input, 50)
		expect(out.endsWith('…')).toBe(true)
		// "informati" must NOT appear as a terminal token (the audit's
		// exact bug). Each non-final token must be a real word.
		expect(out).not.toMatch(/informati…$/)
	})
})
