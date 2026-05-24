/**
 * Pure slug generator for admin create forms.
 *
 * Mirrors the slug regex `^[a-z0-9]+(?:-[a-z0-9]+)*$` enforced by the
 * public schemas (see `src/lib/schemas/blog-api.ts`). Lowercases, strips
 * combining diacritics via NFKD normalization, collapses every run of
 * non-alphanumeric characters into a single hyphen, then trims leading
 * and trailing hyphens. Returns the empty string when the input has no
 * alphanumeric characters; callers are responsible for validating that
 * before submit.
 *
 * No DB call, no async. Safe to import from any environment.
 */
export function slugify(input: string): string {
	return input
		.normalize('NFKD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}
