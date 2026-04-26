import { Button } from 'react-email'
import { BRAND } from '@/lib/_generated/brand'

interface BrandButtonProps {
	href: string
	children: string
}

export function BrandButton({ href, children }: BrandButtonProps) {
	return (
		<Button
			href={href}
			style={{
				backgroundColor: BRAND.primary,
				color: '#ffffff',
				padding: '12px 24px',
				borderRadius: '6px',
				fontSize: '14px',
				fontWeight: 600,
				textDecoration: 'none',
				display: 'inline-block'
			}}
		>
			{children}
		</Button>
	)
}
