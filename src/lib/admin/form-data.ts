/**
 * FormData → plain object flattener used by every admin Server Action
 * before passing the result to a Zod schema's safeParse.
 *
 * Single-occurrence keys produce a string value; repeated keys (e.g. a
 * multi-select for blog tag ids) produce a string array in insertion
 * order. Empty FormData returns `{}`. Non-string values are stringified
 * via `String(value)` so File / Blob inputs never crash the helper
 * (admin forms do not upload files per CONTEXT.md D-04, but defensive
 * handling keeps the helper safe to reuse).
 */
export function formDataToObject(
	formData: FormData
): Record<string, string | string[]> {
	const out: Record<string, string | string[]> = {}
	for (const [key, value] of formData.entries()) {
		const v = typeof value === 'string' ? value : String(value)
		if (key in out) {
			const existing = out[key]
			out[key] = Array.isArray(existing)
				? [...existing, v]
				: [existing as string, v]
		} else {
			out[key] = v
		}
	}
	return out
}
