'use client'

import { USServiceAreaMap } from './USServiceAreaMap'

interface MapProps {
	className?: string
}

export function ServiceAreaMapWrapper({ className }: MapProps) {
	return <USServiceAreaMap className={className} />
}
