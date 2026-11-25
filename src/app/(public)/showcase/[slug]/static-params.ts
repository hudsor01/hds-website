/**
 * Build-time params for /showcase/[slug].
 *
 * The page uses "not-found" param matching, so the slugs returned here are
 * the only showcase pages that render for the life of a deploy.
 * getAllShowcaseSlugs() logs a query error and returns [], which would turn
 * a transient Neon error during a build into a green deploy where every live
 * showcase page is a hard 404. With a database configured, no slugs is
 * therefore a build failure. Builds with no database (local, CI) get the
 * placeholder entry Cache Components needs.
 */

export const SHOWCASE_PLACEHOLDER_SLUG = '__placeholder__'

export function showcaseStaticParams(
	slugs: string[],
	hasDatabase: boolean
): { slug: string }[] {
	if (slugs.length > 0) {
		return slugs.map(slug => ({ slug }))
	}
	if (hasDatabase) {
		throw new Error(
			'No published showcase slugs at build time. The showcase query failed or returned no rows; refusing to build a deploy where every /showcase/[slug] page 404s.'
		)
	}
	return [{ slug: SHOWCASE_PLACEHOLDER_SLUG }]
}
