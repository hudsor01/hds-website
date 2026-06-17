import { ImageResponse } from 'next/og'
import { LOGO_DATA_URL } from '@/lib/og-logo'

export const runtime = 'nodejs'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
	return new ImageResponse(
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: '#ffffff'
			}}
		>
			{/* biome-ignore lint/performance/noImgElement: ImageResponse (Satori) requires a raw img element. */}
			<img src={LOGO_DATA_URL} width={30} alt="Hudson Digital Solutions" />
		</div>,
		{ ...size }
	)
}
