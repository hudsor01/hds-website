import { ImageResponse } from 'next/og'
import { LOGO_DATA_URL } from '@/lib/og-logo'

export const runtime = 'nodejs'
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
				background: '#ffffff',
				borderRadius: 36
			}}
		>
			{/* biome-ignore lint/performance/noImgElement: ImageResponse (Satori) requires a raw img element. */}
			<img src={LOGO_DATA_URL} width={150} alt="Hudson Digital Solutions" />
		</div>,
		{ ...size }
	)
}
