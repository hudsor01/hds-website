import { ImageResponse } from 'next/og'
import { BRAND } from '@/lib/_generated/brand'

export const runtime = 'edge'
export const alt =
	'Hudson Digital Solutions — Professional Websites for Small Businesses'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
	return new ImageResponse(
		<div
			style={{
				height: '100%',
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: '80px',
				background: `linear-gradient(135deg, ${BRAND.primaryDeep} 0%, ${BRAND.primary} 60%, ${BRAND.primary} 100%)`,
				color: BRAND.primaryForeground,
				fontFamily: 'system-ui, sans-serif'
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '16px',
					fontSize: 24,
					fontWeight: 600,
					letterSpacing: '0.18em',
					textTransform: 'uppercase',
					color: BRAND.accent
				}}
			>
				<div
					style={{
						width: 12,
						height: 12,
						background: BRAND.accent,
						borderRadius: 2
					}}
				/>
				Hudson Digital Solutions
			</div>

			<div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
				<div
					style={{
						fontSize: 84,
						fontWeight: 800,
						lineHeight: 1.05,
						letterSpacing: '-0.02em',
						maxWidth: 980
					}}
				>
					Professional Websites for Small Businesses
				</div>
				<div
					style={{
						fontSize: 32,
						fontWeight: 400,
						color: '#cfd8e7',
						maxWidth: 900,
						lineHeight: 1.3
					}}
				>
					We build small businesses the website their reputation deserves.
				</div>
			</div>

			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					borderTop: `2px solid ${BRAND.accent}`,
					paddingTop: '24px',
					fontSize: 22,
					color: '#cfd8e7'
				}}
			>
				<div>hudsondigitalsolutions.com</div>
				<div>Dallas–Fort Worth · TX</div>
			</div>
		</div>,
		{ ...size }
	)
}
