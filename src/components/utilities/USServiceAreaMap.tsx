import { cn } from '@/lib/utils'
import { DFW_MARKER, US_MAP_VIEWBOX, US_STATE_PATHS } from './us-map-paths'

const PRIMARY_STATES = new Set(['48', '12', '13', '40']) // TX, FL, GA, OK

interface USServiceAreaMapProps {
	className?: string
}

export function USServiceAreaMap({ className }: USServiceAreaMapProps) {
	// Decorative map: the headline + paragraph above already convey the
	// service area in text. Hiding the entire SVG from assistive tech
	// avoids state-by-state path traversal that screen readers otherwise
	// announce as 50+ unnamed graphic items.
	return (
		<figure
			className={cn('w-full', className)}
			role="presentation"
			aria-hidden="true"
		>
			<svg
				viewBox={US_MAP_VIEWBOX}
				width="100%"
				height="auto"
				preserveAspectRatio="xMidYMid meet"
				className="block"
			>
				<g
					stroke="var(--color-border)"
					strokeWidth={0.5}
					strokeLinejoin="round"
				>
					{US_STATE_PATHS.map(({ id, d }) => (
						<path
							key={id}
							d={d}
							fill={
								PRIMARY_STATES.has(id)
									? 'oklch(from var(--color-accent) l c h / 0.35)'
									: 'oklch(from var(--color-muted) l c h / 0.8)'
							}
						/>
					))}
				</g>
				<g>
					<circle
						cx={DFW_MARKER.cx}
						cy={DFW_MARKER.cy}
						r={12}
						fill="oklch(from var(--color-accent) l c h / 0.2)"
					/>
					<circle
						cx={DFW_MARKER.cx}
						cy={DFW_MARKER.cy}
						r={6}
						fill="var(--color-accent)"
						stroke="var(--color-background)"
						strokeWidth={2}
					/>
				</g>
			</svg>
		</figure>
	)
}
