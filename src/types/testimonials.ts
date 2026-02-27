/**
 * Testimonial Types and Constants
 * Safe to import in both server and client components
 */

export interface TestimonialRequest {
	id: string
	token: string
	client_name: string
	client_email: string
	project_name?: string
	message?: string
	status?: string
	submitted: boolean
	submitted_at?: string
	expires_at: string
	testimonial_id?: string
	created_at: string
}

export interface Testimonial {
	id: string
	request_id?: string
	client_name: string
	company?: string
	role?: string
	rating: number
	content: string
	photo_url?: string
	video_url?: string
	service_type?: string
	approved: boolean
	featured: boolean
	created_at: string
	updated_at?: string
}

export type ServiceType =
	| 'web-development'
	| 'business-automation'
	| 'digital-marketing'
	| 'ui-ux-design'
	| 'seo'
	| 'other'

export const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
	{ value: 'web-development', label: 'Website Development' },
	{ value: 'business-automation', label: 'Business Automation' },
	{ value: 'digital-marketing', label: 'Digital Marketing' },
	{ value: 'ui-ux-design', label: 'UI/UX Design' },
	{ value: 'seo', label: 'SEO Services' },
	{ value: 'other', label: 'Other' }
]
