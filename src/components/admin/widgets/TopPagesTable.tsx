/**
 * TopPagesTable
 * Server component. Renders the top 10 pathnames by pageviews over the last
 * 30 days in a simple HTML table with tabular-aligned numeric columns.
 * Data comes from the dashboard page; no DB access happens here.
 */

type TopPagesTableProps = {
	rows: Array<{
		pathname: string
		pageviews: number
		uniqueVisitors: number
	}>
}

export function TopPagesTable({ rows }: TopPagesTableProps) {
	return (
		<div className="rounded-xl border border-border bg-surface-raised p-6">
			<h2 className="text-sm font-semibold text-foreground mb-4">
				Top pages (last 30 days)
			</h2>
			{rows.length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-8">
					No page analytics yet.
				</p>
			) : (
				<table className="w-full text-sm">
					<thead>
						<tr>
							<th
								scope="col"
								className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide pb-2 border-b border-border"
							>
								Pathname
							</th>
							<th
								scope="col"
								className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wide pb-2 border-b border-border"
							>
								Pageviews
							</th>
							<th
								scope="col"
								className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wide pb-2 border-b border-border"
							>
								Unique visitors
							</th>
						</tr>
					</thead>
					<tbody>
						{rows.map(row => (
							<tr key={row.pathname}>
								<td className="py-2 text-foreground truncate max-w-[20rem]">
									{row.pathname}
								</td>
								<td className="py-2 text-right font-mono text-foreground tabular-nums">
									{row.pageviews.toLocaleString()}
								</td>
								<td className="py-2 text-right font-mono text-foreground tabular-nums">
									{row.uniqueVisitors.toLocaleString()}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	)
}
