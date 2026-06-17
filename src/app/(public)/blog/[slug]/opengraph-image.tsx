import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/lib/blog'
import { LOGO_DATA_URL } from '@/lib/og-logo'

// Dynamic so the Facebook/social scrape always gets the real post title at
// request time (the build runs without POSTGRES_URL, so a static render would
// bake a generic title). OG images are scraped rarely and cached by the
// platform, so per-request generation is cheap in practice.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const alt = 'Hudson Digital Solutions'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
	params
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const post = await getPostBySlug(slug)
	const title = (post?.title ?? 'Hudson Digital Solutions').slice(0, 110)

	return new ImageResponse(
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				width: '100%',
				height: '100%',
				padding: '72px',
				backgroundColor: '#ffffff'
			}}
		>
			{/* biome-ignore lint/performance/noImgElement: ImageResponse (Satori) requires a raw img element; next/image is unavailable in OG rendering. */}
			<img src={LOGO_DATA_URL} height={64} alt="Hudson Digital Solutions" />
			<div
				style={{
					display: 'flex',
					fontSize: 62,
					fontWeight: 700,
					color: '#070a10',
					lineHeight: 1.15,
					maxWidth: 1056
				}}
			>
				{title}
			</div>
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<div
					style={{
						width: 56,
						height: 8,
						backgroundColor: '#ef852e',
						marginRight: 20
					}}
				/>
				<div style={{ display: 'flex', fontSize: 30, color: '#064180' }}>
					hudsondigitalsolutions.com
				</div>
			</div>
		</div>,
		{ ...size }
	)
}
