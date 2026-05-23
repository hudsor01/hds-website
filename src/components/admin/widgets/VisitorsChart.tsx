'use client'

/**
 * VisitorsChart
 * Recharts line chart of daily pageviews over the last 30 days.
 * Client component because recharts requires browser layout APIs (ResizeObserver).
 * Data is fetched server-side by the dashboard page and passed in as props.
 */
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis
} from 'recharts'

type VisitorsChartProps = {
	data: Array<{ date: string; pageviews: number }>
}

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
	month: 'short',
	day: 'numeric'
})

function formatTick(value: string): string {
	const parsed = new Date(value)
	if (Number.isNaN(parsed.getTime())) {
		return value
	}
	return DATE_FORMATTER.format(parsed)
}

export function VisitorsChart({ data }: VisitorsChartProps) {
	return (
		<div className="rounded-xl border border-border bg-surface-raised p-6">
			<h2 className="text-sm font-semibold text-foreground mb-4">
				Visitors (last 30 days)
			</h2>
			{data.length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-12">
					No traffic data yet.
				</p>
			) : (
				<ResponsiveContainer width="100%" height={280}>
					<LineChart
						data={data}
						margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
						<XAxis
							dataKey="date"
							tick={{ fontSize: 11 }}
							stroke="var(--color-muted-foreground)"
							tickFormatter={formatTick}
						/>
						<YAxis
							tick={{ fontSize: 11 }}
							stroke="var(--color-muted-foreground)"
							allowDecimals={false}
						/>
						<Tooltip
							contentStyle={{
								background: 'var(--color-surface-raised)',
								border: '1px solid var(--color-border)',
								borderRadius: '0.5rem'
							}}
						/>
						<Line
							type="monotone"
							dataKey="pageviews"
							stroke="var(--color-accent)"
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			)}
		</div>
	)
}
