'use client'

import {
	ComposableMap,
	Geographies,
	Geography,
	Marker
} from 'react-simple-maps'
import { cn } from '@/lib/utils'

// US states topojson — standard react-simple-maps CDN source
const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

// FIPS codes for primary service states
const PRIMARY_STATES = new Set(['48', '12', '13', '40']) // TX, FL, GA, OK

// DFW coordinates for the headquarters marker
const DFW_COORDS: [number, number] = [-97.0641, 32.7767]

interface USServiceAreaMapProps {
	className?: string
}

export function USServiceAreaMap({ className }: USServiceAreaMapProps) {
	return (
		<div className={cn('w-full', className)}>
			<ComposableMap
				projection="geoAlbersUsa"
				projectionConfig={{ scale: 880 }}
				style={{ width: '100%', height: 'auto' }}
				aria-label="US service area map highlighting Texas, Florida, Georgia, and Oklahoma"
			>
				<Geographies geography={GEO_URL}>
					{({ geographies }) =>
						geographies.map(geo => {
							const isPrimary = PRIMARY_STATES.has(geo.id as string)
							return (
								<Geography
									key={geo.rsmKey}
									geography={geo}
									style={{
										default: {
											fill: isPrimary
												? 'hsl(var(--accent) / 0.25)'
												: 'hsl(var(--muted) / 0.4)',
											stroke: 'hsl(var(--border))',
											strokeWidth: 0.5,
											outline: 'none'
										},
										hover: {
											fill: isPrimary
												? 'hsl(var(--accent) / 0.45)'
												: 'hsl(var(--muted) / 0.6)',
											stroke: 'hsl(var(--border))',
											strokeWidth: 0.5,
											outline: 'none'
										},
										pressed: {
											fill: 'hsl(var(--accent) / 0.55)',
											outline: 'none'
										}
									}}
								/>
							)
						})
					}
				</Geographies>

				{/* DFW headquarters marker */}
				<Marker coordinates={DFW_COORDS}>
					<circle
						r={6}
						fill="hsl(var(--accent))"
						stroke="hsl(var(--background))"
						strokeWidth={2}
					/>
					<circle r={12} fill="hsl(var(--accent) / 0.2)" />
				</Marker>
			</ComposableMap>
		</div>
	)
}
