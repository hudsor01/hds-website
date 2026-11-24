/**
 * Comma Separator transform: contract + edge cases.
 * Locks the behavior of src/lib/list-formatter.ts.
 */

import { describe, expect, test } from 'bun:test'
import { commaSeparate, countItems, tokenizeList } from '@/lib/list-formatter'

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
		expect(commaSeparate('Alice\r\nBob\r\nCarol\r\n')).toBe('Alice, Bob, Carol')
	})

	test('column of numbers to comma-separated series', () => {
		expect(commaSeparate('10\n20\n30\n40')).toBe('10, 20, 30, 40')
	})

	test('drops blank lines and trims each line', () => {
		expect(commaSeparate('1\n\n  2 \t\n\t3\n')).toBe('1, 2, 3')
	})

	// One value per line keeps spaces inside a value: a pasted column of
	// city names must not split "New York" into two items.
	test('a multi-line paste splits on line breaks only', () => {
		expect(commaSeparate('New York\nLos Angeles')).toBe('New York, Los Angeles')
		expect(countItems('New York\nLos Angeles')).toBe(2)
		expect(commaSeparate('Dallas Fort Worth\r\nSan Antonio\r\n')).toBe(
			'Dallas Fort Worth, San Antonio'
		)
	})

	test('a single line still splits on whitespace', () => {
		expect(commaSeparate('New York')).toBe('New, York')
	})

	test('re-running on comma output stays put in column mode too', () => {
		expect(commaSeparate('apple,\nbanana,\ncherry')).toBe(
			'apple, banana, cherry'
		)
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
			expect(commaSeparate('1 2 3', { quote: 'single' })).toBe("'1', '2', '3'")
		})

		test('double quotes wrap each item', () => {
			expect(commaSeparate('a b c', { quote: 'double' })).toBe('"a", "b", "c"')
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

		// Doubling ("O""Neil") is invalid in JSON, JavaScript and Python;
		// a backslash escape is valid in all three.
		test('double-quote mode escapes an embedded double quote with a backslash', () => {
			const out = commaSeparate('O"Neil Smith', { quote: 'double' })
			expect(out).toBe('"O\\"Neil", "Smith"')
			expect(JSON.parse(`[${out}]`)).toEqual(['O"Neil', 'Smith'])
		})

		test('double-quote mode escapes backslashes so the output stays valid JSON', () => {
			const out = commaSeparate('C:\\temp', { quote: 'double' })
			expect(out).toBe('"C:\\\\temp"')
			expect(JSON.parse(`[${out}]`)).toEqual(['C:\\temp'])
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

	describe('quoted CSV cells', () => {
		test('a quoted cell with a comma is one item on a single line', () => {
			expect(commaSeparate('"Smith, John" "Doe, Jane"')).toBe(
				'Smith, John, Doe, Jane'
			)
			expect(countItems('"Smith, John" "Doe, Jane"')).toBe(2)
		})

		test('quoted cells in a column, with padding around the quotes', () => {
			expect(tokenizeList('  "Smith, John"  \n"Doe, Jane"\n')).toEqual([
				'Smith, John',
				'Doe, Jane'
			])
		})

		test('a doubled quote inside a quoted cell is a literal quote', () => {
			expect(tokenizeList('"he said ""hi"""')).toEqual(['he said "hi"'])
		})

		test('a quoted cell may span lines', () => {
			expect(tokenizeList('"line one\nline two"\nnext')).toEqual([
				'line one\nline two',
				'next'
			])
		})

		test('an unterminated quote is kept as a literal character', () => {
			expect(tokenizeList('say "hi there')).toEqual(['say', '"hi', 'there'])
		})

		test('quoted cells round-trip through double-quote mode', () => {
			const out = commaSeparate('"Smith, John"\n"Doe, Jane"', {
				quote: 'double'
			})
			expect(JSON.parse(`[${out}]`)).toEqual(['Smith, John', 'Doe, Jane'])
		})
	})

	describe('delimiter option', () => {
		const input = 'a\nb\nc'
		test('comma is the default', () => {
			expect(commaSeparate(input)).toBe('a, b, c')
		})
		test('semicolon', () => {
			expect(commaSeparate(input, { delimiter: 'semicolon' })).toBe('a; b; c')
		})
		test('pipe', () => {
			expect(commaSeparate(input, { delimiter: 'pipe' })).toBe('a | b | c')
		})
		test('tab', () => {
			expect(commaSeparate(input, { delimiter: 'tab' })).toBe('a\tb\tc')
		})
		test('newline', () => {
			expect(commaSeparate('a b c', { delimiter: 'newline' })).toBe('a\nb\nc')
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
			expect(commaSeparate('<b> & x"y')).toBe('<b>, &, x"y')
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
