import { z } from 'zod'
import { emailSchema, nameSchema, phoneFieldSchema } from './common'

/**
 * Client-side validation schema for the /free-mockup landing form. Mirrors the
 * form's field shape (which buildFreeMockupPayload maps onto ContactFormData)
 * and reuses the same shared validators the contact form uses, so client and
 * server stay in lockstep. Wired via TanStack Form's onDynamic validator for
 * reward-early-punish-late timing.
 */
export const freeMockupFormSchema = z.object({
	firstName: nameSchema,
	lastName: nameSchema,
	email: emailSchema,
	businessName: z
		.string()
		.trim()
		.min(2, 'Please enter your business name')
		.max(100, 'Business name must be less than 100 characters'),
	// Optional: empty string is valid (the field defaults to '').
	currentSite: z
		.string()
		.trim()
		.max(200, 'Please shorten this to under 200 characters'),
	phone: phoneFieldSchema
})
