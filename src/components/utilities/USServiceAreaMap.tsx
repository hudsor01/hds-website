'use client'

import {
	ComposableMap,
	Geographies,
	Geography,
	Marker
} from 'react-simple-maps'
import { cn } from '@/lib/utils'

// Local topojson — avoids CDN dependency
const GEO_URL = '/us-states.json'

// FIPS codes for primary service states
const PRIMARY_STATES = new Set(['48', '12', '13', '40']) // TX, FL, GA, OK

// DFW coordinates
const DFW_COORDS: [number, number] = [-97.0641, 32.7767]

interface USServiceAreaMapProps {
	className?: string
}

// CSS relative color syntax — valid in SVG inline styles (Chrome/Firefox/Safari 2023+)
// Uses --color-accent / --color-muted / --color-border from Tailwind v4 @theme
const FILL_PRIMARY = 'oklch(from var(--color-accent) l c h / 0.35)'
const FILL_PRIMARY_HOVER = 'oklch(from var(--color-accent) l c h / 0.55)'
const FILL_PRIMARY_PRESSED = 'oklch(from var(--color-accent) l c h / 0.7)'
const FILL_DEFAULT = 'oklch(from var(--color-muted) l c h / 0.8)'
const FILL_DEFAULT_HOVER = 'oklch(from var(--color-muted) l c h / 1)'
const STROKE = 'var(--color-border)'

export function USServiceAreaMap({ className }: USServiceAreaMapProps) {
	return (
		<div className={cn('w-full', className)}>
			<ComposableMap
				projection="geoAlbersUsa"
				projectionConfig={{ scale: 880 }}
				width={800}
				height={500}
				style={{ width: '100%', height: 'auto' }}
				aria-label="US service area map highlighting Texas, Florida, Georgia, and Oklahoma"
			>
				<Geographies geography={GEO_URL}>
					{({ geographies }) =>
						geographies.map(geo => {
							const isPrimary = PRIMARY_STATES.has(String(geo.id))
							return (
								<Geography
									key={geo.rsmKey}
									geography={geo}
									style={{
										default: {
											fill: isPrimary ? FILL_PRIMARY : FILL_DEFAULT,
											stroke: STROKE,
											strokeWidth: 0.5,
											outline: 'none'
										},
										hover: {
											fill: isPrimary ? FILL_PRIMARY_HOVER : FILL_DEFAULT_HOVER,
											stroke: STROKE,
											strokeWidth: 0.5,
											outline: 'none'
										},
										pressed: {
											fill: isPrimary ? FILL_PRIMARY_PRESSED : FILL_DEFAULT,
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
					<circle r={12} fill="oklch(from var(--color-accent) l c h / 0.2)" />
					<circle
						r={6}
						fill="var(--color-accent)"
						stroke="var(--color-background)"
						strokeWidth={2}
					/>
				</Marker>
			</ComposableMap>
		</div>
	)
}
