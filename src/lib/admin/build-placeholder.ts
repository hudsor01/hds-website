/**
 * Build-time placeholder id for admin dynamic routes.
 *
 * Every admin `[id]` page exports `generateStaticParams` that returns
 * `[{ id: BUILD_PLACEHOLDER_ID }]`. This is required because Next.js 16
 * with `cacheComponents: true` rejects an empty static-params list for
 * dynamic routes (`EmptyGenerateStaticParamsError`).
 *
 * Each loader MUST short-circuit to `notFound()` when it sees this id
 * BEFORE calling `await connection()` or any DB read. If `connection()`
 * runs during the build-time prerender of the placeholder, Next.js emits
 * a PPR postponed-boundary marker (`<!--$~-->`) in the prerendered shell.
 * That marker is not handled by React's `$RC` inline reveal script
 * (`$RC` only handles `<!--$?-->` pending-suspense markers), so on
 * production the edge-cached shell ships with the resolved content
 * buffered inside `<div id="S:N" hidden>` but never revealed - operators
 * see an indefinite "Loading..." spinner.
 *
 * Calling `notFound()` synchronously short-circuits the placeholder
 * render to the 404 path with no Suspense streaming boundary, so the
 * prerendered shell contains no `$~` marker. Real ids skip the check
 * and render fully dynamic at runtime as regular `$?` boundaries that
 * `$RC` reveals correctly.
 *
 * Canonical usage in a loader:
 *
 *   async function Loader({ params }: Props) {
 *     const { id } = await params
 *     if (id === BUILD_PLACEHOLDER_ID) {
 *       notFound()
 *     }
 *     await connection()
 *     // ...db read, render
 *   }
 */
export const BUILD_PLACEHOLDER_ID = '__build_placeholder__'
