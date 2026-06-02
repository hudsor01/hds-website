'use client'

/**
 * TrafficSourcesPie
 * Recharts donut of attribution channels over the last 30 days. Shows the
 * top 5 channels individually and rolls the remainder into an "Other" slice.
 * Client component because recharts requires browser layout APIs.
 */
import { useMemo } from 'react'
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip
} from 'recharts'
import { AdminErrorState } from '@/components/admin/AdminErrorState'
import type { AdminQueryResult } from '@/lib/admin/query-result'

type TrafficSourcesPieProps = {
	result: AdminQueryResult<Array<{ channel: string; count: number }>>
}

const SLICE_COLORS = [
	'var(--color-accent)',
	'var(--color-primary)',
	'var(--color-info-text)',
	'var(--color-success-text)',
	'var(--color-warning-text)',
	'var(--color-muted-foreground)'
] as const

const TOP_N = 5

export function TrafficSourcesPie({ result }: TrafficSourcesPieProps) {
	// Hooks must run unconditionally, so derive the rows before the render
	// branch: on the error variant this is an empty array (the chart never
	// renders in that case - the error card does).
	const data = result.ok ? result.data : []
	const chartData = useMemo(() => {
		if (data.length <= TOP_N) {
			return data
		}
		const top = data.slice(0, TOP_N)
		const rest = data.slice(TOP_N)
		const otherCount = rest.reduce((sum, row) => sum + row.count, 0)
		return [...top, { channel: 'Other', count: otherCount }]
	}, [data])

	return (
		<div className="rounded-xl border border-border bg-surface-raised p-6">
			<h2 className="text-sm font-semibold text-foreground mb-4">
				Traffic sources (last 30 days)
			</h2>
			{!result.ok ? (
				<AdminErrorState inline resource="traffic source data" />
			) : chartData.length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-8">
					No traffic source data yet.
				</p>
			) : (
				<div
					role="img"
					aria-label="Traffic sources breakdown over the last 30 days"
				>
					<ResponsiveContainer width="100%" height={240}>
						<PieChart>
							<Pie
								data={chartData}
								dataKey="count"
								nameKey="channel"
								innerRadius={50}
								outerRadius={90}
								paddingAngle={2}
							>
								{chartData.map((entry, index) => (
									<Cell
										key={entry.channel}
										fill={SLICE_COLORS[index % SLICE_COLORS.length]}
									/>
								))}
							</Pie>
							<Tooltip />
							<Legend
								verticalAlign="bottom"
								height={36}
								wrapperStyle={{ fontSize: '0.75rem' }}
							/>
						</PieChart>
					</ResponsiveContainer>
				</div>
			)}
		</div>
	)
}
