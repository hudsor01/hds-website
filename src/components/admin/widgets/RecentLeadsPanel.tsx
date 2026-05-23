/**
 * RecentLeadsPanel
 * Server component. Renders the 10 most recent leads with email, source,
 * relative time, and a status badge color-coded by lifecycle stage.
 * Uses U+00B7 MIDDLE DOT as the source/time separator (STATE.md decision),
 * never an em or en dash.
 */

type RecentLeadsPanelProps = {
	leads: Array<{
		id: string
		email: string
		source: string | null
		status: string | null
		createdAt: Date
	}>
}

const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat(undefined, {
	numeric: 'always'
})

const ABSOLUTE_FORMATTER = new Intl.DateTimeFormat(undefined, {
	month: 'short',
	day: 'numeric',
	year: 'numeric'
})

const MS_PER_SECOND = 1000
const MS_PER_MINUTE = 60 * MS_PER_SECOND
const MS_PER_HOUR = 60 * MS_PER_MINUTE
const MS_PER_DAY = 24 * MS_PER_HOUR
const MS_PER_30_DAYS = 30 * MS_PER_DAY

function relativeTime(date: Date): string {
	const diffMs = date.getTime() - Date.now()
	const absMs = Math.abs(diffMs)

	if (absMs >= MS_PER_30_DAYS) {
		return ABSOLUTE_FORMATTER.format(date)
	}
	if (absMs >= MS_PER_DAY) {
		return RELATIVE_FORMATTER.format(Math.round(diffMs / MS_PER_DAY), 'day')
	}
	if (absMs >= MS_PER_HOUR) {
		return RELATIVE_FORMATTER.format(Math.round(diffMs / MS_PER_HOUR), 'hour')
	}
	if (absMs >= MS_PER_MINUTE) {
		return RELATIVE_FORMATTER.format(
			Math.round(diffMs / MS_PER_MINUTE),
			'minute'
		)
	}
	return RELATIVE_FORMATTER.format(Math.round(diffMs / MS_PER_SECOND), 'second')
}

function statusClass(status: string | null): string {
	if (status === 'new') {
		return 'bg-info-light text-info-text'
	}
	if (status === 'contacted') {
		return 'bg-warning-light text-warning-text'
	}
	if (status === 'qualified') {
		return 'bg-success-light text-success-text'
	}
	if (status === 'closed') {
		return 'bg-muted text-muted-foreground'
	}
	return 'bg-muted text-muted-foreground'
}

export function RecentLeadsPanel({ leads }: RecentLeadsPanelProps) {
	return (
		<div className="rounded-xl border border-border bg-surface-raised p-6">
			<h2 className="text-sm font-semibold text-foreground mb-4">
				Recent leads
			</h2>
			{leads.length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-8">
					No leads yet.
				</p>
			) : (
				<ul className="divide-y divide-border">
					{leads.map(lead => (
						<li
							key={lead.id}
							className="py-3 flex items-center justify-between gap-3"
						>
							<div className="min-w-0">
								<p className="text-sm font-medium text-foreground truncate">
									{lead.email}
								</p>
								<p className="text-xs text-muted-foreground">
									{lead.source ?? 'direct'} · {relativeTime(lead.createdAt)}
								</p>
							</div>
							<span
								className={`text-xs font-medium px-2 py-1 rounded-full ${statusClass(lead.status)}`}
							>
								{lead.status ?? 'new'}
							</span>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
