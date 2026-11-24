/**
 * Testimonial Types
 * Safe to import in both server and client components
 */

export interface TestimonialRequest {
	id: string
	token: string
	client_name: string
	/** Empty string when the request was created without an email. */
	client_email: string
	project_name?: string
	status: 'pending' | 'submitted'
	submitted: boolean
	submitted_at?: string
	/** null when the row has no expiry; such a link never validates. */
	expires_at: string | null
	testimonial_id?: string
	created_at: string | null
}

export interface Testimonial {
	id: string
	client_name: string
	company?: string
	role?: string
	/** null when the client (or the admin) left the review unrated. */
	rating: number | null
	content: string
	photo_url?: string
	video_url?: string
	approved: boolean
	featured: boolean
	created_at: string | null
	updated_at?: string
}
