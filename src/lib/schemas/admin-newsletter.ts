/**
 * Admin Newsletter Validation Schemas
 *
 * Phase 05 admin-mutation schema set for `/admin/newsletter`. Three mutations:
 *  - `setStatusSchema` backs both unsubscribe and re-subscribe actions; the
 *    Server Action layer supplies the synthetic `status` value so the operator
 *    only posts the row id and the intent comes from the form binding.
 *  - `deleteSubscriberSchema` backs the GDPR hard-delete action (see
 *    `.planning/phases/05-admin-ops/05-CONTEXT.md` section 5.3).
 *
 * Pure Zod file (no DB imports) consumed by:
 *  - The admin Server Actions in `src/app/admin/newsletter/actions.ts`
 *    (safeParse on FormData -> object).
 */
import { z } from 'zod'

export const SUBSCRIBER_STATUSES_FOR_SET = ['active', 'unsubscribed'] as const
export type SubscriberStatusForSet =
	(typeof SUBSCRIBER_STATUSES_FOR_SET)[number]

// Bounced is observable (set by the email provider webhook) but not
// operator-settable. If a use case appears, extend SUBSCRIBER_STATUSES_FOR_SET
// instead of adding a separate schema.

export const setStatusSchema = z.object({
	id: z.string().uuid({ message: 'Invalid subscriber id.' }),
	status: z.enum(SUBSCRIBER_STATUSES_FOR_SET, {
		message: 'Pick a valid status.'
	})
})

export const deleteSubscriberSchema = z.object({
	id: z.string().uuid({ message: 'Invalid subscriber id.' })
})

export type SetStatusInput = z.infer<typeof setStatusSchema>
export type DeleteSubscriberInput = z.infer<typeof deleteSubscriberSchema>
