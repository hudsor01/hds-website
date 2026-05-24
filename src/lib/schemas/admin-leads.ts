/**
 * Admin Leads Validation Schemas.
 *
 * Pure Zod file (no DB imports) consumed by the four Server Actions in
 * `src/app/admin/leads/actions.ts` to safeParse FormData -> object payloads
 * before any DB mutation runs.
 *
 * Phase 05 mutations covered here:
 *  1. updateLeadStatus  (id + status enum)
 *  2. addLeadNote       (leadId + content 1-4000 chars)
 *  3. deleteLead        (id)
 *  4. deleteLeadNote    (noteId + leadId, leadId kept so the action can
 *     revalidate the correct detail page after the delete)
 *
 * The `leads.status` column is plain `text` with default `'new'` and NO
 * CHECK constraint at the DB layer (see `src/lib/schemas/leads.ts`), so the
 * `LEAD_STATUSES` whitelist below is the single source of truth for valid
 * lead statuses. Adding a new status means adding it here AND making sure
 * the `StatusBadge` color map (`src/components/admin/StatusBadge.tsx`)
 * already covers it.
 */
import { z } from 'zod'

export const LEAD_STATUSES = [
	'new',
	'contacted',
	'qualified',
	'closed'
] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const updateLeadStatusSchema = z.object({
	id: z.string().uuid({ message: 'Invalid lead id.' }),
	status: z.enum(LEAD_STATUSES, { message: 'Pick a valid status.' })
})
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>

export const addLeadNoteSchema = z.object({
	leadId: z.string().uuid({ message: 'Invalid lead id.' }),
	content: z
		.string()
		.trim()
		.min(1, 'Note cannot be empty.')
		.max(4000, 'Note must be under 4000 characters.')
})
export type AddLeadNoteInput = z.infer<typeof addLeadNoteSchema>

export const deleteLeadSchema = z.object({
	id: z.string().uuid({ message: 'Invalid lead id.' })
})

export const deleteLeadNoteSchema = z.object({
	noteId: z.string().uuid({ message: 'Invalid note id.' }),
	// Used to revalidate the correct detail page after delete.
	leadId: z.string().uuid({ message: 'Invalid lead id.' })
})
