import { Hr, Link, Section, Text } from 'react-email'
import { BRAND } from '@/lib/_generated/brand'
import { BUSINESS_INFO } from '@/lib/constants/business'

interface BrandFooterProps {
	unsubscribeUrl?: string
}

const FOOTER_TEXT_STYLE = {
	fontSize: '12px',
	color: BRAND.mutedForeground,
	lineHeight: 1.5,
	margin: '8px 0'
}

const FOOTER_LINK_STYLE = {
	color: BRAND.primary,
	textDecoration: 'underline'
}

export function BrandFooter({ unsubscribeUrl }: BrandFooterProps) {
	return (
		<Section style={{ marginTop: '32px' }}>
			<Hr
				style={{
					border: 'none',
					borderTop: `1px solid ${BRAND.border}`,
					margin: '24px 0'
				}}
			/>
			<Text style={FOOTER_TEXT_STYLE}>
				{BUSINESS_INFO.name} · {BUSINESS_INFO.location.city},{' '}
				{BUSINESS_INFO.location.stateCode}
			</Text>
			<Text style={FOOTER_TEXT_STYLE}>
				<Link href={`mailto:${BUSINESS_INFO.email}`} style={FOOTER_LINK_STYLE}>
					{BUSINESS_INFO.email}
				</Link>
				{' · '}
				<Link href={BUSINESS_INFO.links.website} style={FOOTER_LINK_STYLE}>
					hudsondigitalsolutions.com
				</Link>
			</Text>
			{unsubscribeUrl && (
				<Text style={FOOTER_TEXT_STYLE}>
					<Link href={unsubscribeUrl} style={FOOTER_LINK_STYLE}>
						Unsubscribe
					</Link>
				</Text>
			)}
		</Section>
	)
}
