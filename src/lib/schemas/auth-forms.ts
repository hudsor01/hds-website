/**
 * Zod schemas for sign-in and sign-up form inputs.
 *
 * Shared by the client form components (`SignInForm`, `SignUpForm`) and any
 * future server-side validation. Intentionally NOT marked as a server-only
 * module so the same schema runs in the browser before the network call and
 * on the server when Better Auth eventually validates the request.
 *
 * Email validation reuses the shared validator from `./common.ts` to stay
 * consistent with the contact / newsletter forms (lowercased, trimmed,
 * non-empty). Passwords are length-checked only; Better Auth handles hashing.
 */
import { z } from 'zod'
import { emailSchema } from '@/lib/schemas/common'

const passwordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters')
	.max(128, 'Password must be less than 128 characters')

export const signInSchema = z.object({
	email: emailSchema,
	password: passwordSchema
})

export const signUpSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters')
		.optional()
})

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
