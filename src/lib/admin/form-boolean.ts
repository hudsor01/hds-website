/**
 * Zod schema for booleans coming from HTML form data.
 *
 * `z.coerce.boolean()` is WRONG for form data. It wraps native JS
 * `Boolean(value)`, which treats every non-empty string as truthy.
 * That means:
 *
 *   Boolean("false") === true    // <-- the bug
 *   Boolean("0")     === true
 *
 * So any admin form that does `String(false)` -> `"false"` on its way
 * into FormData (which is what `formDataToObject` produces) ends up
 * with the schema decoding `"false"` as `true`. The operator clicks
 * "save draft", the action stores `published: true`, the row goes
 * live on the public site. This is the failure mode `formBoolean`
 * exists to prevent.
 *
 * Accepted shapes:
 *   - JS `boolean`        -> passthrough
 *   - `"true"`, `"on"`    -> `true`     (`"on"` is HTML's default
 *                                        checkbox value when no
 *                                        `value` attribute is set)
 *   - `"false"`, `""`     -> `false`    (empty string = unchecked
 *                                        checkbox surface)
 *   - missing key         -> `false` via `.default(...)` on the
 *                                        consumer side
 *   - anything else       -> Zod rejects
 *
 * Used in every admin Zod schema in place of `z.coerce.boolean()`.
 */
import { z } from 'zod'

export const formBoolean = z.preprocess(value => {
	if (typeof value === 'boolean') {
		return value
	}
	if (typeof value === 'string') {
		if (value === 'true' || value === 'on') {
			return true
		}
		if (value === 'false' || value === '') {
			return false
		}
	}
	return value
}, z.boolean())
