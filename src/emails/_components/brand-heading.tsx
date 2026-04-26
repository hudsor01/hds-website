import type { ReactNode } from 'react'
import { Heading } from 'react-email'
import { BRAND } from '@/lib/_generated/brand'

interface BrandHeadingProps {
	level?: 1 | 2 | 3
	children: ReactNode
}

const FONT_SIZE: Record<1 | 2 | 3, string> = {
	1: '24px',
	2: '20px',
	3: '16px'
}

export function BrandHeading({ level = 1, children }: BrandHeadingProps) {
	return (
		<Heading
			as={`h${level}` as 'h1' | 'h2' | 'h3'}
			style={{
				color: BRAND.primary,
				fontSize: FONT_SIZE[level],
				fontWeight: 600,
				margin: '0 0 16px 0',
				lineHeight: 1.3
			}}
		>
			{children}
		</Heading>
	)
}
