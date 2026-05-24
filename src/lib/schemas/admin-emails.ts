/**
 * Phase 05 admin-mutation schema set for `/admin/emails`.
 *
 * Defines the three Zod schemas that gate the scheduled-email Server Actions:
 *  - `retryEmailSchema`     -> retryScheduledEmailAction
 *  - `cancelEmailSchema`    -> cancelScheduledEmailAction
 *  - `deleteEmailSchema`    -> deleteScheduledEmailAction
 *
 * All three accept the same `{ id: uuid }` shape because the scheduled-emails
 * surface only exposes single-row mutations keyed by id (CONTEXT.md §5.4).
 *
 * Note on the retry guard: the rule "`retryCount < maxRetries` before a retry
 * is allowed" is enforced INSIDE `retryScheduledEmail()` in the query layer,
 * not in this schema. The schema has no access to the DB row, so the only
 * input it can validate is the id format. The query function reads the row
 * first and refuses the mutation when the retry limit has been reached.
 */
import { z } from 'zod'

export const retryEmailSchema = z.object({
	id: z.string().uuid({ message: 'Invalid email id.' })
})

export const cancelEmailSchema = z.object({
	id: z.string().uuid({ message: 'Invalid email id.' })
})

export const deleteEmailSchema = z.object({
	id: z.string().uuid({ message: 'Invalid email id.' })
})

export type RetryEmailInput = z.infer<typeof retryEmailSchema>
export type CancelEmailInput = z.infer<typeof cancelEmailSchema>
export type DeleteEmailInput = z.infer<typeof deleteEmailSchema>
