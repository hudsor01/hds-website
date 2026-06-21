import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/lib/blog'
import { OG_FONTS } from '@/lib/og-fonts'
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

// Brand tokens from globals.css (oklch) converted to hex, since Satori cannot
// read CSS variables or oklch. Keep in sync with @theme in src/app/globals.css.
const C = {
	background: '#ffffff', // --color-surface-elevated (matches the logo's white)
	foreground: '#070a10', // --color-foreground (title)
	accent: '#ef852e', // --color-accent (dash)
	accentText: '#a44100', // --color-accent-text (eyebrow, legible)
	primaryDeep: '#002561', // --color-primary-deep (footer band)
	inverted: '#fafaf9', // --color-text-inverted (footer text)
	footerMuted: 'rgba(250,250,249,0.66)'
}

function eyebrowFor(tag: string | undefined): string {
	return (tag ?? 'Insights').replace(/-/g, ' ').toUpperCase()
}

export default async function Image({
	params
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const post = await getPostBySlug(slug)
	const title = (post?.title ?? 'Hudson Digital Solutions').slice(0, 110)
	const eyebrow = eyebrowFor(post?.tags?.[0]?.name)

	return new ImageResponse(
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				width: '100%',
				height: '100%',
				backgroundColor: C.background,
				fontFamily: 'Hanken Grotesk'
			}}
		>
			{/* Content area: logo top, title block anchored at the bottom. */}
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					flexGrow: 1,
					padding: '64px 72px 48px'
				}}
			>
				{/* biome-ignore lint/performance/noImgElement: ImageResponse (Satori) requires a raw img element; next/image is unavailable in OG rendering. */}
				<img src={LOGO_DATA_URL} height={46} alt="Hudson Digital Solutions" />
				<div style={{ display: 'flex', flexGrow: 1 }} />
				{/* Eyebrow: accent dash + category label */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						marginBottom: 22
					}}
				>
					<div
						style={{
							width: 44,
							height: 6,
							borderRadius: 3,
							backgroundColor: C.accent,
							marginRight: 18
						}}
					/>
					<div
						style={{
							display: 'flex',
							fontSize: 26,
							fontWeight: 700,
							letterSpacing: 3,
							color: C.accentText
						}}
					>
						{eyebrow}
					</div>
				</div>
				{/* Title */}
				<div
					style={{
						display: 'flex',
						fontSize: 62,
						fontWeight: 700,
						lineHeight: 1.12,
						letterSpacing: -1,
						color: C.foreground,
						maxWidth: 1010
					}}
				>
					{title}
				</div>
			</div>
			{/* Footer band: brand navy with domain + positioning line. */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					backgroundColor: C.primaryDeep,
					padding: '30px 72px'
				}}
			>
				<div
					style={{
						display: 'flex',
						fontSize: 30,
						fontWeight: 700,
						color: C.inverted
					}}
				>
					hudsondigitalsolutions.com
				</div>
				<div
					style={{
						display: 'flex',
						fontSize: 25,
						fontWeight: 600,
						color: C.footerMuted
					}}
				>
					Websites that drive revenue, Dallas to Fort Worth
				</div>
			</div>
		</div>,
		{ ...size, fonts: OG_FONTS }
	)
}
