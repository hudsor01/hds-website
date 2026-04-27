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
