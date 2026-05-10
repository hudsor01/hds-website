// SEO-related type definitions
export interface SEOMetaData {
	title: string
	description: string
	keywords?: string
	ogTitle?: string
	ogDescription?: string
	ogImage?: string
	canonical?: string
	noindex?: boolean
	structuredData?: object
}
