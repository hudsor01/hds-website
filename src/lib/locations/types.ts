interface LocationFeature {
	title: string
	description: string
}

interface LocationStats {
	businesses: string
	projects: string
	satisfaction: string
}

export interface LocationData {
	slug: string
	city: string
	state: string
	stateCode: string
	tagline: string
	description: string
	metaDescription: string
	neighborhoods: string[]
	stats: LocationStats
	features: LocationFeature[]
}
