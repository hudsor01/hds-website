/**
 * Escape `]]>` inside an XML CDATA section.
 *
 * The standard pattern splits the sequence across two adjacent CDATA
 * sections so neither one closes prematurely. Without this, any `]]>`
 * in user content (uncommon but possible after `stripMarkdown` leaves
 * chars verbatim) terminates the CDATA early and breaks XML parsing
 * in feed readers (RSS, Atom).
 *
 * Example:
 *   escapeCdata('foo ]]> bar') === 'foo ]]]]><![CDATA[> bar'
 *   becomes  <![CDATA[foo ]]]]><![CDATA[> bar]]>
 *   which parses as the literal text `foo ]]> bar`.
 */
export function escapeCdata(value: string): string {
	return value.replace(/]]>/g, ']]]]><![CDATA[>')
}

/**
 * Escape the five XML predefined entities for use in element text / attribute
 * values that are NOT wrapped in CDATA (e.g. an RSS `<link>` or `<guid>` whose
 * content is interpolated directly).
 *
 * Blog slugs are constrained to `[a-z0-9-]` today, so this is defense in depth:
 * if that constraint ever loosens, an `&`/`<`/`>` in a slug would otherwise
 * produce invalid XML that breaks feed parsers.
 */
export function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
}
