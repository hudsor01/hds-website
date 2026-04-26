import type { ReactNode } from 'react'
import { Text } from 'react-email'
import { BRAND } from '@/lib/_generated/brand'

interface LabelledRowProps {
	label: string
	children: ReactNode
}

export function LabelledRow({ label, children }: LabelledRowProps) {
	return (
		<Text
			style={{
				fontSize: '14px',
				lineHeight: 1.6,
				margin: '4px 0'
			}}
		>
			<strong style={{ color: BRAND.foreground }}>{label}:</strong> {children}
		</Text>
	)
}
