/**
 * List formatter utilities.
 *
 * Converts a pasted list into a clean delimited series. Built for the
 * "Comma Separator" tool: paste a spreadsheet column, get `a, b, c`.
 *
 * Splitting rules:
 * - Input with a line break is a column: each line is one item, trimmed,
 *   blank lines dropped. Spaces inside a line are kept, so "New York" on
 *   one line stays one item.
 * - Single-line input splits on runs of whitespace (space, tab, Unicode
 *   spaces), so `1 2 3` becomes three items.
 * - A double-quoted cell is one item in either mode, CSV style:
 *   `"Smith, John"` is the item `Smith, John` and `""` inside quotes is a
 *   literal `"`. An unterminated quote is kept as a literal character.
 * - Leading and trailing commas are stripped from each unquoted item, so
 *   re-running the tool on its own output (`1, 2, 3`) is a no-op.
 */

export type QuoteStyle = 'none' | 'single' | 'double'

export type Delimiter = 'comma' | 'semicolon' | 'pipe' | 'tab' | 'newline'

export interface CommaSeparateOptions {
	/** Wrap each item in quotes (for SQL `IN (...)` / array literals). Default 'none'. */
	quote?: QuoteStyle
	/** Drop duplicate items, keeping first occurrence. Default false. */
	dedupe?: boolean
	/** What goes between items. Default 'comma' (a comma and a space). */
	delimiter?: Delimiter
}

const DELIMITER_TEXT: Record<Delimiter, string> = {
	comma: ', ',
	semicolon: '; ',
	pipe: ' | ',
	tab: '\t',
	newline: '\n'
}

const WHITESPACE = /\s/u
const LINE_BREAK = /[\r\n]/

/**
 * Split input into cells. `isSeparator` decides what ends a cell outside
 * quotes. Returns raw cells plus whether each one was quoted.
 */
function splitCells(
	input: string,
	isSeparator: (char: string) => boolean,
	literalQuoteAt = -1
): { text: string; quoted: boolean }[] {
	const cells: { text: string; quoted: boolean }[] = []
	let current = ''
	let quoted = false
	let index = 0

	const push = () => {
		cells.push({ text: current, quoted })
		current = ''
		quoted = false
	}

	while (index < input.length) {
		const char = input[index] ?? ''
		const startsQuotedCell =
			char === '"' && index !== literalQuoteAt && current.trim() === ''
		if (startsQuotedCell) {
			const close = findClosingQuote(input, index + 1)
			if (close === -1) {
				// Unterminated: rescan from here with this quote as plain text.
				return [
					...cells,
					...splitCells(
						current + input.slice(index),
						isSeparator,
						current.length
					)
				]
			}
			current = input.slice(index + 1, close).replaceAll('""', '"')
			quoted = true
			index = close + 1
			continue
		}
		if (isSeparator(char)) {
			push()
		} else if (!(quoted && WHITESPACE.test(char))) {
			// Padding after a closing quote is not part of the cell.
			current += char
		}
		index++
	}
	push()
	return cells
}

/** Index of the quote that closes a CSV cell, skipping `""` escapes. */
function findClosingQuote(input: string, from: number): number {
	let index = from
	while (index < input.length) {
		if (input[index] === '"') {
			if (input[index + 1] === '"') {
				index += 2
				continue
			}
			return index
		}
		index++
	}
	return -1
}

/**
 * Split raw input into clean items (see the module note for the rules).
 */
export function tokenizeList(input: string): string[] {
	if (typeof input !== 'string' || input.length === 0) {
		return []
	}
	const isColumn = LINE_BREAK.test(input)
	const cells = splitCells(input, char =>
		isColumn ? LINE_BREAK.test(char) : WHITESPACE.test(char)
	)
	return cells
		.map(cell =>
			cell.quoted
				? cell.text
				: cell.text
						.trim()
						.replace(/^,+|,+$/g, '')
						.trim()
		)
		.filter(item => item.length > 0)
}

/**
 * Number of items the output will contain. Pass the same options used
 * for `commaSeparate` so the count matches the rendered list. Most
 * importantly, with `dedupe` on the count reflects the deduped result.
 */
export function countItems(
	input: string,
	options: CommaSeparateOptions = {}
): number {
	const items = tokenizeList(input)
	return options.dedupe ? new Set(items).size : items.length
}

function wrapItem(item: string, quote: QuoteStyle): string {
	switch (quote) {
		case 'single':
			// SQL standard: O'Brien -> 'O''Brien'.
			return `'${item.replaceAll("'", "''")}'`
		case 'double':
			// Backslash escapes, valid in JSON, JavaScript and Python:
			// O"Neil -> "O\"Neil". The backslash itself is escaped first.
			return `"${item.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
		default:
			return item
	}
}

/**
 * Convert pasted input into a delimited series.
 * Returns an empty string for blank/whitespace-only input.
 */
export function commaSeparate(
	input: string,
	options: CommaSeparateOptions = {}
): string {
	const { quote = 'none', dedupe = false, delimiter = 'comma' } = options
	const tokens = tokenizeList(input)
	const items = dedupe ? Array.from(new Set(tokens)) : tokens
	return items
		.map(item => wrapItem(item, quote))
		.join(DELIMITER_TEXT[delimiter])
}
