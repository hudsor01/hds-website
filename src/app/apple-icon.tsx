import { ImageResponse } from 'next/og'
import { BRAND } from '@/lib/_generated/brand'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
	return new ImageResponse(
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: `linear-gradient(135deg, ${BRAND.primaryDeep} 0%, ${BRAND.primary} 100%)`,
				color: BRAND.primaryForeground,
				fontSize: 110,
				fontWeight: 800,
				fontFamily: 'system-ui, sans-serif',
				letterSpacing: '-0.06em',
				borderRadius: 36
			}}
		>
			H
		</div>,
		{ ...size }
	)
}
