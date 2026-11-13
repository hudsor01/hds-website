interface LocationFeature {
	title: string
	description: string
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
	features: LocationFeature[]
}
