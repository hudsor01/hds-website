/**
 * Comma Separator transform — contract + edge cases.
 * Locks the behavior of src/lib/list-formatter.ts.
 */

import { describe, expect, test } from 'bun:test'
import {
	commaSeparate,
	countItems,
	tokenizeList
} from '@/lib/list-formatter'

describe('commaSeparate', () => {
	test('the headline case: space separated numbers to comma list', () => {
		expect(commaSeparate('1 2 3 4 5')).toBe('1, 2, 3, 4, 5')
	})

	test('words separated by spaces', () => {
		expect(commaSeparate('apple banana cherry')).toBe('apple, banana, cherry')
	})

	test('collapses runs of multiple spaces', () => {
		expect(commaSeparate('1   2  3')).toBe('1, 2, 3')
	})

	test('trims leading and trailing whitespace', () => {
		expect(commaSeparate('   1 2 3   ')).toBe('1, 2, 3')
	})

	test('handles tabs as separators', () => {
		expect(commaSeparate('1\t2\t3')).toBe('1, 2, 3')
	})

	test('handles newlines (a pasted column)', () => {
		expect(commaSeparate('1\n2\n3')).toBe('1, 2, 3')
	})

	// The headline use case: a spreadsheet column (one value per line,
	// often with a trailing newline and CRLF line endings from Windows).
	test('converts a spreadsheet column (CRLF + trailing newline) to a series', () => {
		expect(commaSeparate('Alice\r\nBob\r\nCarol\r\n')).toBe(
			'Alice, Bob, Carol'
		)
	})

	test('column of numbers to comma-separated series', () => {
		expect(commaSeparate('10\n20\n30\n40')).toBe('10, 20, 30, 40')
	})

	test('handles mixed whitespace including blank lines', () => {
		expect(commaSeparate('1\n\n2 \t 3\n')).toBe('1, 2, 3')
	})

	test('handles Unicode whitespace (non-breaking space)', () => {
		expect(commaSeparate('1 2 3')).toBe('1, 2, 3')
	})

	test('single item returns itself', () => {
		expect(commaSeparate('1')).toBe('1')
	})

	test('empty input returns empty string', () => {
		expect(commaSeparate('')).toBe('')
	})

	test('whitespace-only input returns empty string', () => {
		expect(commaSeparate('   \n\t  ')).toBe('')
	})

	// Idempotency: running the tool on already-comma-separated text must
	// not double up commas. This is what edge-comma stripping buys us.
	test('is idempotent on already comma-separated input', () => {
		const once = commaSeparate('1 2 3')
		expect(once).toBe('1, 2, 3')
		expect(commaSeparate(once)).toBe('1, 2, 3')
	})

	test('tolerates input that is already partly comma-separated', () => {
		expect(commaSeparate('1, 2, 3')).toBe('1, 2, 3')
		expect(commaSeparate('1,2,3')).toBe('1,2,3') // no whitespace = single token, edge commas trimmed
	})

	test('preserves commas inside a token (thousands separators)', () => {
		expect(commaSeparate('1,000 2,000')).toBe('1,000, 2,000')
	})

	test('strips stray leading/trailing commas per token', () => {
		expect(commaSeparate(',1 2, ,3,')).toBe('1, 2, 3')
	})

	// Lock intentional behavior surfaced by the battle test:
	// a standalone all-comma token is dropped (keeps the transform
	// idempotent), and a no-whitespace comma string is a single token
	// (so "1,000" thousands separators survive).
	test('drops a standalone all-comma token', () => {
		expect(commaSeparate('1 ,,, 2')).toBe('1, 2')
	})

	test('no-whitespace comma string stays one token', () => {
		expect(commaSeparate('1,2,3')).toBe('1,2,3')
	})

	describe('quote option', () => {
		test('single quotes wrap each item', () => {
			expect(commaSeparate('1 2 3', { quote: 'single' })).toBe(
				"'1', '2', '3'"
			)
		})

		test('double quotes wrap each item', () => {
			expect(commaSeparate('a b c', { quote: 'double' })).toBe(
				'"a", "b", "c"'
			)
		})

		test('quote none is the default and adds no quotes', () => {
			expect(commaSeparate('a b', { quote: 'none' })).toBe('a, b')
		})

		test('empty input stays empty even with quotes on', () => {
			expect(commaSeparate('', { quote: 'single' })).toBe('')
		})

		// Battle-test: the quote option is advertised for SQL/arrays, so an
		// embedded quote must be escaped (doubled) or it emits broken,
		// injectable output.
		test('single-quote mode doubles an embedded apostrophe (valid SQL)', () => {
			expect(commaSeparate("O'Brien Smith", { quote: 'single' })).toBe(
				"'O''Brien', 'Smith'"
			)
		})

		test('double-quote mode doubles an embedded double quote (ANSI)', () => {
			expect(commaSeparate('say "hi"', { quote: 'double' })).toBe(
				'"say", """hi"""'
			)
		})

		test('escaping composes with dedupe', () => {
			expect(
				commaSeparate("O'Brien O'Brien Smith", {
					quote: 'single',
					dedupe: true
				})
			).toBe("'O''Brien', 'Smith'")
		})
	})

	describe('dedupe option', () => {
		test('removes duplicates, keeping first occurrence order', () => {
			expect(commaSeparate('3 1 2 1 3', { dedupe: true })).toBe('3, 1, 2')
		})

		test('dedupe off keeps duplicates', () => {
			expect(commaSeparate('1 1 2', { dedupe: false })).toBe('1, 1, 2')
		})

		test('dedupe combines with quoting', () => {
			expect(commaSeparate('a a b', { dedupe: true, quote: 'double' })).toBe(
				'"a", "b"'
			)
		})

		test('dedupe is case-sensitive (A and a are different items)', () => {
			expect(commaSeparate('A a A', { dedupe: true })).toBe('A, a')
		})
	})

	describe('robustness', () => {
		test('large input does not choke and preserves count', () => {
			const n = 5000
			const input = Array.from({ length: n }, (_, i) => String(i)).join(' ')
			const out = commaSeparate(input)
			expect(out.split(', ').length).toBe(n)
			expect(out.startsWith('0, 1, 2')).toBe(true)
			expect(out.endsWith('4998, 4999')).toBe(true)
		})

		test('does not interpret items as HTML/code (no escaping, raw passthrough)', () => {
			expect(commaSeparate('<b> & "x"')).toBe('<b>, &, "x"')
		})

		test('preserves emoji and multibyte tokens', () => {
			expect(commaSeparate('a 🚀 b')).toBe('a, 🚀, b')
		})
	})
})

describe('countItems', () => {
	test('counts tokens', () => {
		expect(countItems('1 2 3')).toBe(3)
	})

	test('blank input counts zero', () => {
		expect(countItems('   ')).toBe(0)
	})

	test('matches the number of comma-joined items produced', () => {
		const input = '  a  b\tc\nd '
		expect(countItems(input)).toBe(commaSeparate(input).split(', ').length)
	})

	// Battle-test: the count must reflect dedupe so the UI label matches
	// the rendered/copied output and analytics aren't over-reported.
	test('is option-aware: dedupe count matches deduped output length', () => {
		expect(countItems('1 2 3 2 1', { dedupe: true })).toBe(3)
	})

	test('without dedupe still counts raw tokens (no regression)', () => {
		expect(countItems('1 2 3 2 1')).toBe(5)
	})

	test('comma-trimmed duplicates are counted after dedupe', () => {
		expect(countItems(',1 1 1,', { dedupe: true })).toBe(1)
	})
})

describe('tokenizeList', () => {
	test('returns an array of clean tokens', () => {
		expect(tokenizeList(' 1 2  3 ')).toEqual(['1', '2', '3'])
	})

	test('empty input returns empty array', () => {
		expect(tokenizeList('')).toEqual([])
	})

	// Guards the non-string path used defensively in the util.
	test('non-string input returns empty array', () => {
		// @ts-expect-error intentional: exercising the runtime guard
		expect(tokenizeList(null)).toEqual([])
		// @ts-expect-error intentional: exercising the runtime guard
		expect(tokenizeList(undefined)).toEqual([])
	})
})
