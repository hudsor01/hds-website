import type { ZodError } from 'zod'

/**
 * Flatten a ZodError into a field-keyed message map for the admin form
 * `{ ok: false, errors }` envelope. Nested paths join with '.'; issues with no
 * path collapse to the form-level '_form' key. The first message per key wins.
 *
 * Shared by every admin Server Action (showcase / blog / testimonials /
 * leads / emails / newsletter) so the flattening stays identical across the
 * CRUD surfaces.
 */
export function flattenZod(error: ZodError): Record<string, string> {
	const out: Record<string, string> = {}
	for (const issue of error.issues) {
		const path = issue.path.join('.') || '_form'
		if (!(path in out)) {
			out[path] = issue.message
		}
	}
	return out
}
