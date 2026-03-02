declare module 'react-simple-maps' {
	import type { ReactNode, CSSProperties } from 'react'

	interface Geography {
		rsmKey: string
		id: string | number
		properties: Record<string, unknown>
	}

	interface ComposableMapProps {
		projection?: string
		projectionConfig?: Record<string, unknown>
		style?: CSSProperties
		children?: ReactNode
		'aria-label'?: string
	}

	interface GeographiesProps {
		geography: string | object
		children: (props: { geographies: Geography[] }) => ReactNode
	}

	interface GeographyProps {
		key?: string
		geography: Geography
		style?: {
			default?: CSSProperties
			hover?: CSSProperties
			pressed?: CSSProperties
		}
	}

	interface MarkerProps {
		coordinates: [number, number]
		children?: ReactNode
	}

	export function ComposableMap(props: ComposableMapProps): JSX.Element
	export function Geographies(props: GeographiesProps): JSX.Element
	export function Geography(props: GeographyProps): JSX.Element
	export function Marker(props: MarkerProps): JSX.Element
}
