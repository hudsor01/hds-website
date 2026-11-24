/**
 * JSON Formatter core: lossless formatting, honest warnings and parse
 * errors with a computed line and column.
 */

import { describe, expect, test } from 'bun:test'
import {
	canonicalDecimal,
	formatJson,
	type JsonResult,
	minifyJson,
	validateJson
} from '@/lib/json-tools'

function output(result: JsonResult): string {
	if (!result.ok) {
		throw new Error(`expected success, got: ${result.error.message}`)
	}
	return result.output
}

function error(result: JsonResult) {
	if (result.ok) {
		throw new Error('expected a parse error')
	}
	return result.error
}

describe('formatJson matches JSON.stringify layout for ordinary data', () => {
	const samples = [
		'{"a":1,"b":[true,false,null],"c":{"d":"x"}}',
		'[]',
		'{}',
		'[[],{},[{}]]',
		'"just a string"',
		'42',
		'{"nested":{"deep":{"deeper":[1,2,{"x":"y"}]}}}',
		'{"esc":"line\\nbreak \\"quoted\\""}'
	]
	for (const sample of samples) {
		test(sample, () => {
			const parsed: unknown = JSON.parse(sample)
			expect(output(formatJson(sample, '2'))).toBe(
				JSON.stringify(parsed, null, 2)
			)
			expect(output(formatJson(sample, '4'))).toBe(
				JSON.stringify(parsed, null, 4)
			)
			expect(output(minifyJson(sample))).toBe(JSON.stringify(parsed))
		})
	}

	test('the tab option indents with a real tab, not one space', () => {
		expect(output(formatJson('{"a":[1]}', 'tab'))).toBe(
			'{\n\t"a": [\n\t\t1\n\t]\n}'
		)
	})

	test('minify strips all insignificant whitespace', () => {
		expect(output(minifyJson('{\r\n  "a" : [ 1 , 2 ]\n}\n'))).toBe(
			'{"a":[1,2]}'
		)
	})

	test('a leading byte order mark is ignored', () => {
		expect(output(minifyJson(`${String.fromCharCode(0xfeff)}{"a":1}`))).toBe(
			'{"a":1}'
		)
	})
})

describe('lossless: values are re-emitted exactly as written', () => {
	test('an integer above 2^53 is kept and flagged', () => {
		const result = formatJson('{"id": 12345678901234567890}')
		expect(output(result)).toBe('{\n  "id": 12345678901234567890\n}')
		expect(result.ok && result.warnings).toEqual([
			{
				kind: 'precision',
				path: '$.id',
				message:
					'12345678901234567890 is larger than 2^53. It is kept exactly here, but JavaScript and many JSON parsers round it to 12345678901234567000'
			}
		])
	})

	test('duplicate keys are both kept and flagged instead of "Valid JSON"', () => {
		const result = minifyJson('{"a":1,"a":2}')
		expect(output(result)).toBe('{"a":1,"a":2}')
		expect(result.ok && result.warnings).toEqual([
			{
				kind: 'duplicate-key',
				path: '$.a',
				message:
					'Duplicate key "a". Every copy is kept here, but most parsers keep only the last one'
			}
		])
	})

	test('escaped and plain spellings of one key count as duplicates', () => {
		const result = validateJson('{"a":1,"\\u0061":2}')
		expect(result.ok && result.warnings.map(w => w.kind)).toEqual([
			'duplicate-key'
		])
	})

	test('number spellings survive: 1.0, 1e2, 1E+2, -0', () => {
		const result = minifyJson('[1.0,1e2,1E+2,-0,0.50]')
		expect(output(result)).toBe('[1.0,1e2,1E+2,-0,0.50]')
		// Only -0 changes value in JavaScript; the others are the same number.
		expect(result.ok && result.warnings.map(w => w.kind)).toEqual([
			'negative-zero'
		])
	})

	test('a decimal beyond float precision is flagged', () => {
		const result = validateJson('{"pi":3.14159265358979323846}')
		expect(result.ok && result.warnings).toHaveLength(1)
		expect(result.ok && result.warnings[0]?.kind).toBe('precision')
	})

	test('an overflowing number is flagged (JSON.parse gives Infinity)', () => {
		const result = validateJson('[1e400]')
		expect(result.ok && result.warnings[0]?.message).toContain('Infinity')
	})

	test('ordinary numbers raise no warning', () => {
		const result = validateJson('[0, -1, 0.1, 9007199254740991, 2.5e-3]')
		expect(result.ok && result.warnings).toEqual([])
	})

	test('string escapes are not rewritten', () => {
		expect(output(minifyJson('["\\u00e9", "\\/"]'))).toBe('["\\u00e9","\\/"]')
	})

	test('paths quote keys that are not identifiers', () => {
		const result = validateJson('{"a b":{"x":1,"x":2}}')
		expect(result.ok && result.warnings[0]?.path).toBe('$["a b"].x')
	})
})

describe('parse errors carry a computed line and column', () => {
	test('trailing comma', () => {
		const err = error(formatJson('{\n  "a": 1,\n}'))
		expect(err.message).toContain('Trailing comma')
		expect(err.line).toBe(3)
		expect(err.column).toBe(1)
	})

	test('missing comma between properties', () => {
		const err = error(formatJson('{"a": 1\n "b": 2}'))
		expect(err.message).toBe(
			'Expected "," or "}" after the property value, found """'
		)
		expect([err.line, err.column]).toEqual([2, 2])
	})

	test('single quotes', () => {
		const err = error(formatJson("{'a': 1}"))
		expect(err.message).toContain('double quotes')
		expect([err.line, err.column]).toEqual([1, 2])
	})

	test('unquoted word', () => {
		const err = error(formatJson('[1, undefined]'))
		expect(err.message).toContain('"undefined"')
		expect([err.line, err.column]).toEqual([1, 5])
	})

	test('unterminated string points at its opening quote', () => {
		const err = error(formatJson('{\n"a": "abc'))
		expect(err.message).toContain('Unterminated string')
		expect([err.line, err.column]).toEqual([2, 6])
	})

	test('raw line break inside a string', () => {
		expect(error(formatJson('"a\nb"')).message).toContain('\\n')
	})

	test('invalid escape', () => {
		expect(error(formatJson('"\\x41"')).message).toContain('Invalid escape')
	})

	test('invalid numbers', () => {
		for (const bad of ['01', '1.', '+1', '0x1F', '-', '1e', '.5', 'NaN']) {
			expect(formatJson(bad).ok).toBe(false)
		}
	})

	test('content after the value', () => {
		const err = error(formatJson('{"a":1} {"b":2}'))
		expect(err.message).toContain('after the end of the JSON value')
		expect(err.column).toBe(9)
	})

	test('unexpected end of input', () => {
		expect(error(formatJson('{"a": [1, 2')).message).toContain('missing a "]"')
	})

	test('columns count characters, not UTF-16 units', () => {
		// The rocket emoji is two UTF-16 units but one character.
		const err = error(formatJson('["🚀" x]'))
		expect(err.column).toBe(6)
	})

	test('CRLF line endings count as one line break', () => {
		expect(error(formatJson('[\r\n1,\r\n]')).line).toBe(3)
	})

	test('empty input asks for JSON', () => {
		expect(error(formatJson('   ')).message).toContain('empty')
	})

	test('very deep nesting fails cleanly', () => {
		const deep = `${'['.repeat(5000)}${']'.repeat(5000)}`
		expect(error(formatJson(deep)).message).toContain('nested too deeply')
	})
})

describe('agrees with JSON.parse on what is valid', () => {
	const inputs = [
		'{"a":1}',
		'[1,2,3]',
		'true',
		'null',
		'-0.5e-10',
		'"\\ud83d\\ude80"',
		' \t\n\r[] ',
		'{"a":}',
		'[1,]',
		'{,}',
		'[01]',
		'"\t"',
		'tru',
		'nulls',
		'{"a" 1}',
		'[1 2]',
		'"\\u12G4"',
		'{"a":1,}',
		'[-]',
		'1 2'
	]
	for (const input of inputs) {
		test(JSON.stringify(input), () => {
			let valid = true
			try {
				JSON.parse(input)
			} catch {
				valid = false
			}
			expect(validateJson(input).ok).toBe(valid)
		})
	}
})

describe('canonicalDecimal', () => {
	test('equal values compare equal across spellings', () => {
		expect(canonicalDecimal('1.0')).toBe(canonicalDecimal('1'))
		expect(canonicalDecimal('1e2')).toBe(canonicalDecimal('100'))
		expect(canonicalDecimal('0.000')).toBe('0')
	})

	test('different values differ', () => {
		expect(canonicalDecimal('12345678901234567890')).not.toBe(
			canonicalDecimal('12345678901234567000')
		)
	})
})
