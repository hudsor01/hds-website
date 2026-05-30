/**
 * List formatter utilities.
 *
 * Converts a loosely-separated list (spaces, tabs, newlines, or a mix)
 * into a clean comma-separated list. Built for the "Comma Separator"
 * tool: paste `1 2 3 4 5`, get `1, 2, 3, 4, 5`.
 */

export type QuoteStyle = 'none' | 'single' | 'double'

export interface CommaSeparateOptions {
	/** Wrap each item in quotes (for SQL `IN (...)` / array literals). Default 'none'. */
	quote?: QuoteStyle
	/** Drop duplicate items, keeping first occurrence. Default false. */
	dedupe?: boolean
}

const QUOTE_CHAR: Record<QuoteStyle, string> = {
	none: '',
	single: "'",
	double: '"'
}

const JOINER = ', '

/**
 * Split raw input into clean tokens.
 *
 * - Splits on runs of ANY whitespace (space, tab, newline, and Unicode
 *   spaces like non-breaking space, since JS `\s` covers them), so a
 *   pasted column or multi-space input both normalize.
 * - Strips leading/trailing commas from each token. This makes the
 *   transform idempotent: re-running it on `1, 2, 3` yields `1, 2, 3`
 *   rather than `1,, 2,, 3`, and it tolerates input that is already
 *   partly comma-separated. Commas INSIDE a token (e.g. `1,000`) are
 *   preserved.
 * - Drops empty tokens, so leading/trailing whitespace and blank lines
 *   do not produce empty items.
 */
export function tokenizeList(input: string): string[] {
	if (typeof input !== 'string' || input.length === 0) {
		return []
	}
	return input
		.split(/\s+/u)
		.map(token => token.replace(/^,+|,+$/g, ''))
		.filter(token => token.length > 0)
}

/**
 * Number of items the output will contain. Pass the same options used
 * for `commaSeparate` so the count matches the rendered list — most
 * importantly, with `dedupe` on the count reflects the deduped result
 * (otherwise the UI would show e.g. "5 items" beside a 3-item output).
 */
export function countItems(
	input: string,
	options: CommaSeparateOptions = {}
): number {
	const tokens = tokenizeList(input)
	return options.dedupe ? new Set(tokens).size : tokens.length
}

/**
 * Convert whitespace-separated input into a comma-separated string.
 * Returns an empty string for blank/whitespace-only input.
 */
export function commaSeparate(
	input: string,
	options: CommaSeparateOptions = {}
): string {
	const { quote = 'none', dedupe = false } = options
	const tokens = tokenizeList(input)
	const items = dedupe ? Array.from(new Set(tokens)) : tokens
	const wrap = QUOTE_CHAR[quote]
	// Escape the quote char inside each token by doubling it (the SQL and
	// ANSI standard: O'Brien -> 'O''Brien'). Without this, the quote
	// option — advertised for SQL `IN (...)` and array literals — would
	// emit unbalanced, injectable output for any value containing the
	// quote character.
	const rendered = wrap
		? items.map(token => `${wrap}${token.replaceAll(wrap, wrap + wrap)}${wrap}`)
		: items
	return rendered.join(JOINER)
}
