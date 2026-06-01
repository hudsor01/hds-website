import { z } from 'zod'

// Common validation patterns. `.email()` covers both empty + malformed
// input with a single error message — chaining `.min(1, 'required')`
// before it surfaces both errors at once on an empty submit and reads
// as buggy in the UI (audit #258). Trim + lowercase happen first so a
// whitespace-only submission ('   ') normalises to '' and fails
// `.email()` rather than slipping past the `.min(1)` gate.
export const emailSchema = z
	.string()
	.trim()
	.toLowerCase()
	.email('Please enter a valid email address')

export const phoneSchema = z
	.string()
	.regex(/^[\d\s\-+()]+$/, 'Please enter a valid phone number')
	.min(10, 'Phone number must be at least 10 characters')
	.max(20, 'Phone number must be less than 20 characters')
	.optional()
	.or(z.literal(''))

export const urlSchema = z
	.string()
	.url('Please enter a valid URL')
	.startsWith('https://', 'URL must use HTTPS')

export const nameSchema = z
	.string()
	.min(2, 'Name must be at least 2 characters')
	.max(50, 'Name must be less than 50 characters')
	// Unicode-aware: \p{L} (any letter) + \p{M} (combining marks) so accented
	// names (José, Peña, Nguyễn) and the mobile-autocorrected curly apostrophe
	// (’) validate instead of being rejected. Still rejects digits and symbols,
	// preserving the original anti-garbage intent.
	.regex(
		/^[\p{L}\p{M}\s\-'’]+$/u,
		'Name can only contain letters, spaces, hyphens, and apostrophes'
	)
	.trim()

export const companySchema = z
	.string()
	.max(100, 'Company name must be less than 100 characters')
	.optional()
	.or(z.literal(''))

export const messageSchema = z
	.string()
	.min(10, 'Message must be at least 10 characters')
	.max(5000, 'Message must be less than 5000 characters')
	.trim()

// Service options for contact forms. Must mirror the SERVICES catalog
// in `src/components/ui/ServicesGrid.tsx` — keep enum values, JSON
// labels in `src/data/form-options.json`, and the cards in sync so a
// prospect's "Service Interest" picks reflect what we actually pitch
// (audit #250). Existing leads whose `service` column holds the legacy
// values ('web-development', 'custom-software', 'consulting') remain
// in the DB as plain text — the enum gates only new submissions.
export const serviceOptionsSchema = z.enum([
	'website-design',
	'seo',
	'booking-payments',
	'other'
])

export const budgetOptionsSchema = z.enum([
	'under-5k',
	'5k-15k',
	'15k-50k',
	'50k-plus'
])

export const timelineOptionsSchema = z.enum([
	'asap',
	'1-month',
	'3-months',
	'6-months',
	'flexible'
])
