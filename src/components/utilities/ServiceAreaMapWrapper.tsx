'use client'

import { type ComponentType, useEffect, useState } from 'react'

interface MapProps {
	className?: string
}

type MapComponent = ComponentType<MapProps>

export function ServiceAreaMapWrapper({ className }: MapProps) {
	const [Map, setMap] = useState<MapComponent | null>(null)

	useEffect(() => {
		import('./USServiceAreaMap').then(m => {
			setMap(() => m.USServiceAreaMap)
		})
	}, [])

	if (!Map) {
		return (
			<div className="aspect-[8/5] w-full bg-muted/30 rounded-xl animate-pulse" />
		)
	}

	return <Map className={className} />
}
