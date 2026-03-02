'use client'

import dynamic from 'next/dynamic'

const USServiceAreaMap = dynamic(
	() =>
		import('@/components/utilities/USServiceAreaMap').then(
			m => m.USServiceAreaMap
		),
	{
		ssr: false,
		loading: () => <div className="h-64 bg-muted rounded-lg animate-pulse" />
	}
)

export function ServiceAreaMapWrapper({ className }: { className?: string }) {
	return <USServiceAreaMap className={className} />
}
