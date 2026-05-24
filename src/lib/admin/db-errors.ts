/**
 * Postgres unique-violation predicate.
 *
 * Returns true when `error` looks like a Postgres error object whose
 * `code` is `'23505'` (SQLSTATE `unique_violation`) and whose `message`
 * or `detail` contains the literal `column` substring. node-postgres
 * surfaces the offending column in the constraint message (e.g.
 * `duplicate key value violates unique constraint "showcase_slug_unique"`)
 * and in the structured `detail` field (e.g. `Key (slug)=(...) already
 * exists.`), so we search both.
 *
 * Returns false for anything that is not an object, for non-23505 errors,
 * and for 23505 errors whose constraint references a different column.
 */
export function isUniqueViolation(error: unknown, column: string): boolean {
	if (!error || typeof error !== 'object') {
		return false
	}
	const e = error as { code?: unknown; message?: unknown; detail?: unknown }
	if (e.code !== '23505') {
		return false
	}
	const message = typeof e.message === 'string' ? e.message : ''
	const detail = typeof e.detail === 'string' ? e.detail : ''
	return `${message} ${detail}`.includes(column)
}
