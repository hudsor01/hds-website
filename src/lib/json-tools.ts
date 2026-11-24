/**
 * JSON tools for the JSON Formatter.
 *
 * `JSON.parse` + `JSON.stringify` silently changes data: integers above
 * 2^53 are rounded, duplicate keys collapse to the last one, `1.0` becomes
 * `1`, `1e2` becomes `100` and `-0` becomes `0`. This module never round
 * trips through JavaScript values. A strict RFC 8259 scanner re-emits every
 * original token (strings, numbers, keys) with new whitespace only, so the
 * output always carries exactly the data the input did.
 *
 * Along the way it records what other JSON tools would get wrong
 * (duplicate keys, numbers a JavaScript parser would round or overflow,
 * `-0`) so the UI can warn about it, and it reports parse errors with a
 * line and column computed here, because some browsers (Safari) give no
 * position at all.
 */

export type JsonIndent = '2' | '4' | 'tab'

export type JsonWarningKind = 'duplicate-key' | 'precision' | 'negative-zero'

export interface JsonWarning {
	kind: JsonWarningKind
	/** Location in the document, e.g. `$.items[2].id`. */
	path: string
	message: string
}

export interface JsonParseError {
	message: string
	/** 1-based line number. */
	line: number
	/** 1-based column, counted in characters (code points). */
	column: number
	/** 0-based offset into the input string (UTF-16 units). */
	offset: number
}

export type JsonResult =
	| { ok: true; output: string; warnings: JsonWarning[] }
	| { ok: false; error: JsonParseError }

const INDENT_TEXT: Record<JsonIndent, string> = {
	'2': '  ',
	'4': '    ',
	tab: '\t'
}

// Deeper documents are almost certainly not hand-written data and would
// risk exhausting the call stack.
const MAX_DEPTH = 1000

const BYTE_ORDER_MARK = String.fromCharCode(0xfeff)

const NUMBER_PATTERN = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y
const IDENTIFIER_PATTERN = /[A-Za-z_$][\w$]*/y

class JsonSyntaxError extends Error {
	readonly offset: number

	constructor(message: string, offset: number) {
		super(message)
		this.offset = offset
	}
}

/** Format with the chosen indent. Values are re-emitted exactly. */
export function formatJson(
	input: string,
	indent: JsonIndent = '2'
): JsonResult {
	return run(input, INDENT_TEXT[indent])
}

/** Minify: same tokens, no insignificant whitespace. */
export function minifyJson(input: string): JsonResult {
	return run(input, null)
}

/** Validate only. Same checks and warnings as formatting. */
export function validateJson(
	input: string
):
	| { ok: true; warnings: JsonWarning[] }
	| { ok: false; error: JsonParseError } {
	const result = run(input, null)
	return result.ok ? { ok: true, warnings: result.warnings } : result
}

function run(input: string, indent: string | null): JsonResult {
	const parser = new Parser(input, indent)
	try {
		return {
			ok: true,
			output: parser.parseDocument(),
			warnings: parser.warnings
		}
	} catch (error) {
		if (error instanceof JsonSyntaxError) {
			return { ok: false, error: locate(input, error.message, error.offset) }
		}
		if (error instanceof RangeError) {
			return {
				ok: false,
				error: locate(input, 'This JSON is nested too deeply to format', 0)
			}
		}
		throw error
	}
}

/** Turn an offset into a 1-based line and column. CRLF counts as one break. */
export function locate(
	input: string,
	message: string,
	offset: number
): JsonParseError {
	const before = input.slice(0, offset)
	const lines = before.split(/\r\n|\r|\n/)
	const lastLine = lines[lines.length - 1] ?? ''
	return {
		message,
		line: lines.length,
		column: Array.from(lastLine).length + 1,
		offset
	}
}

function describeChar(char: string | undefined): string {
	if (char === undefined) {
		return 'end of input'
	}
	if (char === '\n' || char === '\r') {
		return 'a line break'
	}
	if (char === '\t') {
		return 'a tab'
	}
	return `"${char}"`
}

class Parser {
	readonly warnings: JsonWarning[] = []
	private pos = 0
	private readonly text: string
	private readonly indent: string | null
	/** 1 when a leading BOM was skipped, so error offsets match the input. */
	private readonly offsetShift: number

	constructor(text: string, indent: string | null) {
		// A leading byte order mark is an encoding artifact, not data.
		this.text = text.startsWith(BYTE_ORDER_MARK) ? text.slice(1) : text
		this.indent = indent
		this.offsetShift = text.length - this.text.length
	}

	parseDocument(): string {
		this.skipWhitespace()
		if (this.pos >= this.text.length) {
			this.fail('The input is empty. Paste some JSON first')
		}
		const output = this.parseValue('$', 0)
		this.skipWhitespace()
		if (this.pos < this.text.length) {
			this.fail(
				`Unexpected ${describeChar(this.peek())} after the end of the JSON value. Only one top-level value is allowed`
			)
		}
		return output
	}

	private fail(message: string, at: number = this.pos): never {
		throw new JsonSyntaxError(message, at + this.offsetShift)
	}

	private peek(): string | undefined {
		return this.text[this.pos]
	}

	private skipWhitespace(): void {
		while (this.pos < this.text.length) {
			const char = this.text[this.pos]
			if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
				this.pos++
			} else {
				break
			}
		}
	}

	private newline(depth: number): string {
		return this.indent === null ? '' : `\n${this.indent.repeat(depth)}`
	}

	private parseValue(path: string, depth: number): string {
		if (depth > MAX_DEPTH) {
			this.fail('This JSON is nested too deeply to format')
		}
		const char = this.peek()
		switch (char) {
			case '{':
				return this.parseObject(path, depth)
			case '[':
				return this.parseArray(path, depth)
			case '"':
				return this.parseString()
			case 't':
			case 'f':
			case 'n':
				return this.parseLiteral()
			default:
				if (
					char === '-' ||
					(char !== undefined && char >= '0' && char <= '9')
				) {
					return this.parseNumber(path)
				}
				return this.unexpectedValue()
		}
	}

	private unexpectedValue(): never {
		const char = this.peek()
		if (char === undefined) {
			this.fail('Unexpected end of input. A value is missing')
		}
		if (char === "'") {
			this.fail('Strings must use double quotes (") in JSON, not single quotes')
		}
		if (char === '}' || char === ']') {
			this.fail(`Unexpected "${char}". A value is missing`)
		}
		IDENTIFIER_PATTERN.lastIndex = this.pos
		const word = IDENTIFIER_PATTERN.exec(this.text)?.[0]
		if (word) {
			this.fail(
				`Unexpected word "${word}". Text values must be in double quotes, and only true, false and null are allowed bare`
			)
		}
		this.fail(`Unexpected ${describeChar(char)}. Expected a JSON value`)
	}

	private parseObject(path: string, depth: number): string {
		this.pos++ // {
		this.skipWhitespace()
		if (this.peek() === '}') {
			this.pos++
			return '{}'
		}
		const seen = new Set<string>()
		const members: string[] = []
		const separator = this.indent === null ? ':' : ': '
		while (true) {
			this.skipWhitespace()
			const char = this.peek()
			if (char !== '"') {
				if (char === '}') {
					this.fail('Trailing comma before "}" is not allowed in JSON')
				}
				if (char === "'") {
					this.fail('Property names must use double quotes (") in JSON')
				}
				if (char === undefined) {
					this.fail('Unexpected end of input. The object is missing a "}"')
				}
				this.fail(
					`Unexpected ${describeChar(char)}. Property names must be strings in double quotes`
				)
			}
			const keyStart = this.pos
			const rawKey = this.parseString()
			const key = JSON.parse(rawKey) as string
			const memberPath = childPath(path, key)
			if (seen.has(key)) {
				this.warnings.push({
					kind: 'duplicate-key',
					path: memberPath,
					message: `Duplicate key "${key}". Every copy is kept here, but most parsers keep only the last one`
				})
			}
			seen.add(key)
			this.skipWhitespace()
			if (this.peek() !== ':') {
				this.fail(
					`Expected ":" after the property name, found ${describeChar(this.peek())}`,
					this.peek() === undefined ? keyStart : this.pos
				)
			}
			this.pos++
			this.skipWhitespace()
			const value = this.parseValue(memberPath, depth + 1)
			members.push(`${rawKey}${separator}${value}`)
			this.skipWhitespace()
			const next = this.peek()
			if (next === ',') {
				this.pos++
				continue
			}
			if (next === '}') {
				this.pos++
				break
			}
			if (next === undefined) {
				this.fail('Unexpected end of input. The object is missing a "}"')
			}
			this.fail(
				`Expected "," or "}" after the property value, found ${describeChar(next)}`
			)
		}
		const inner = this.newline(depth + 1)
		return `{${inner}${members.join(`,${inner}`)}${this.newline(depth)}}`
	}

	private parseArray(path: string, depth: number): string {
		this.pos++ // [
		this.skipWhitespace()
		if (this.peek() === ']') {
			this.pos++
			return '[]'
		}
		const items: string[] = []
		while (true) {
			this.skipWhitespace()
			if (this.peek() === ']') {
				this.fail('Trailing comma before "]" is not allowed in JSON')
			}
			items.push(this.parseValue(`${path}[${items.length}]`, depth + 1))
			this.skipWhitespace()
			const next = this.peek()
			if (next === ',') {
				this.pos++
				continue
			}
			if (next === ']') {
				this.pos++
				break
			}
			if (next === undefined) {
				this.fail('Unexpected end of input. The array is missing a "]"')
			}
			this.fail(
				`Expected "," or "]" after the array item, found ${describeChar(next)}`
			)
		}
		const inner = this.newline(depth + 1)
		return `[${inner}${items.join(`,${inner}`)}${this.newline(depth)}]`
	}

	/** Returns the string token exactly as written, quotes included. */
	private parseString(): string {
		const start = this.pos
		this.pos++ // opening quote
		while (this.pos < this.text.length) {
			const code = this.text.charCodeAt(this.pos)
			if (code === 0x22) {
				this.pos++
				return this.text.slice(start, this.pos)
			}
			if (code === 0x5c) {
				this.parseEscape()
				continue
			}
			if (code < 0x20) {
				this.fail(
					code === 0x0a || code === 0x0d
						? 'Line breaks inside a string must be written as \\n'
						: 'Control characters inside a string must be escaped'
				)
			}
			this.pos++
		}
		this.fail('Unterminated string. A closing double quote is missing', start)
	}

	private parseEscape(): void {
		const escapeStart = this.pos
		this.pos++ // backslash
		const char = this.peek()
		if (char === 'u') {
			const hex = this.text.slice(this.pos + 1, this.pos + 5)
			if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
				this.fail(
					'Invalid unicode escape. Use \\u followed by four hex digits',
					escapeStart
				)
			}
			this.pos += 5
			return
		}
		if (char !== undefined && '"\\/bfnrt'.includes(char)) {
			this.pos++
			return
		}
		this.fail(
			`Invalid escape "\\${char ?? ''}". Allowed escapes are \\" \\\\ \\/ \\b \\f \\n \\r \\t and \\uXXXX`,
			escapeStart
		)
	}

	private parseLiteral(): string {
		for (const literal of ['true', 'false', 'null']) {
			if (this.text.startsWith(literal, this.pos)) {
				const after = this.text[this.pos + literal.length]
				if (after === undefined || !/[\w$]/.test(after)) {
					this.pos += literal.length
					return literal
				}
			}
		}
		return this.unexpectedValue()
	}

	private parseNumber(path: string): string {
		const start = this.pos
		NUMBER_PATTERN.lastIndex = start
		const raw = NUMBER_PATTERN.exec(this.text)?.[0]
		const after = raw === undefined ? undefined : this.text[start + raw.length]
		if (
			raw === undefined ||
			raw === '-' ||
			(after !== undefined && /[\w.+-]/.test(after))
		) {
			const bad = /^[-+\w.]+/.exec(this.text.slice(start))?.[0] ?? ''
			this.fail(
				`Invalid number "${bad}". JSON numbers have no leading zeros, leading "+", trailing "." or hex`,
				start
			)
		}
		this.pos += raw.length
		this.checkNumber(raw, path)
		return raw
	}

	private checkNumber(raw: string, path: string): void {
		const value = Number(raw)
		if (!Number.isFinite(value)) {
			this.warnings.push({
				kind: 'precision',
				path,
				message: `${raw} is too large for a JavaScript number. JSON.parse turns it into Infinity, which re-serializes as null`
			})
			return
		}
		if (Object.is(value, -0) && raw.startsWith('-')) {
			this.warnings.push({
				kind: 'negative-zero',
				path,
				message: `${raw} is kept as written, but JavaScript writes it back out as 0`
			})
			return
		}
		if (canonicalDecimal(raw) !== canonicalDecimal(String(value))) {
			const isInteger = !/[.eE]/.test(raw)
			this.warnings.push({
				kind: 'precision',
				path,
				message: isInteger
					? `${raw} is larger than 2^53. It is kept exactly here, but JavaScript and many JSON parsers round it to ${String(value)}`
					: `${raw} has more precision than a 64-bit float holds. It is kept exactly here, but many JSON parsers read it as ${String(value)}`
			})
		}
	}
}

function childPath(parent: string, key: string): string {
	return /^[A-Za-z_$][\w$]*$/.test(key)
		? `${parent}.${key}`
		: `${parent}[${JSON.stringify(key)}]`
}

/**
 * Exact decimal value of a JSON number literal as "digits@exponent" with
 * no leading or trailing zeros, so 1.0, 1e0 and 1 compare equal while
 * 12345678901234567890 and 12345678901234567000 do not.
 */
export function canonicalDecimal(raw: string): string {
	const match = /^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(raw)
	if (!match) {
		return raw
	}
	const [, sign = '', intPart = '', fracPart = '', expPart = '0'] = match
	let digits = `${intPart}${fracPart}`
	let exponent = Number(expPart) + intPart.length
	const leading = digits.length - digits.replace(/^0+/, '').length
	digits = digits.slice(leading)
	exponent -= leading
	digits = digits.replace(/0+$/, '')
	if (digits === '') {
		return '0'
	}
	return `${sign}${digits}@${exponent}`
}
