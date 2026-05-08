/**
 * Safe JSON-LD Component
 *
 * Renders structured data inside <script type="application/ld+json">.
 *
 * Two security concerns are addressed here:
 *
 * 1. `</script>` breakout: `JSON.stringify` does NOT escape `</script>`,
 *    so a DB-sourced field containing the literal string `</script>` would
 *    terminate the tag and the trailing content would parse as HTML/JS.
 *    We escape `<`, `>`, `&`, plus U+2028 / U+2029 line and paragraph
 *    separators (legal in JSON, illegal in JS string literals). This is
 *    the canonical JSON-in-HTML escape pattern; Next.js itself does the
 *    same thing for NEXT_DATA serialization.
 *
 * 2. CSP: this component renders an inline <script>. Strict CSP would
 *    block it without a nonce, but reading the nonce via `headers()` here
 *    forces every consuming page to be dynamic (incompatible with static
 *    generation under cacheComponents). The CSP in security-headers.ts
 *    keeps `'unsafe-inline'` alongside `'nonce-{n}' 'strict-dynamic'` —
 *    modern browsers ignore `'unsafe-inline'` for actual scripts (those
 *    need the nonce or strict-dynamic chain), while inert JSON-LD payloads
 *    are still rendered.
 */

interface JsonLdProps {
	data: Record<string, unknown>
}

// Built via RegExp() so the source file stays ASCII-only — TS would parse
// literal U+2028/U+2029 as line terminators in a regex literal.
const ESCAPE_RE = /[<>&\u2028\u2029]/g

function escapeChar(ch: string): string {
	switch (ch.charCodeAt(0)) {
		case 0x3c:
			return '\\u003c'
		case 0x3e:
			return '\\u003e'
		case 0x26:
			return '\\u0026'
		case 0x2028:
			return '\\u2028'
		case 0x2029:
			return '\\u2029'
		default:
			return ch
	}
}

function safeStringify(data: unknown): string {
	return JSON.stringify(data).replace(ESCAPE_RE, escapeChar)
}

export function JsonLd({ data }: JsonLdProps) {
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: safeStringify(data) }}
			suppressHydrationWarning
		/>
	)
}
