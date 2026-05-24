/**
 * Phase 05 status pill primitive (server component).
 *
 * Renders a small pill for any status string the Phase 05 ops pages care
 * about (leads / calculator leads / newsletter subscribers / scheduled
 * emails). The status -> class map below is the single source of truth for
 * Phase 05 status coloring; changing a color for one resource changes it
 * everywhere the same status string appears.
 *
 * The palette aligns with the existing Phase 03 widgets -- WebVitalsCards
 * and RecentLeadsPanel -- which use the OKLCH `*-text` and `*-light` token
 * family from `src/app/globals.css`. No new color tokens are introduced and
 * no hardcoded colors appear in this file.
 *
 * Both `null` and `undefined` render the literal text `unknown` with the
 * default muted class, so the badge is safe to drop into any cell backed by
 * a nullable column without per-call guards.
 */

export interface StatusBadgeProps {
	status: string | null | undefined
}

const STATUS_CLASSES: Record<string, string> = {
	// leads
	new: 'text-info-text bg-info-light border-border',
	contacted: 'text-accent-text bg-surface-base border-border',
	qualified: 'text-success-text bg-success-light border-border',
	closed: 'text-muted-foreground bg-surface-raised border-border',
	// newsletter
	active: 'text-success-text bg-success-light border-border',
	unsubscribed: 'text-muted-foreground bg-surface-raised border-border',
	bounced: 'text-destructive-text bg-destructive-light border-border',
	// emails
	pending: 'text-warning-text bg-warning-light border-border',
	sent: 'text-success-text bg-success-light border-border',
	failed: 'text-destructive-text bg-destructive-light border-border',
	cancelled: 'text-muted-foreground bg-surface-raised border-border',
	// calculator-lead quality (treated as status for badge purposes)
	hot: 'text-destructive-text bg-destructive-light border-border',
	warm: 'text-warning-text bg-warning-light border-border',
	cold: 'text-muted-foreground bg-surface-raised border-border'
}

const DEFAULT_CLASS = 'text-muted-foreground bg-surface-raised border-border'

export function StatusBadge({ status }: StatusBadgeProps) {
	const key = status ?? ''
	const cls = STATUS_CLASSES[key] ?? DEFAULT_CLASS
	const label = status ?? 'unknown'
	return (
		<span
			className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${cls}`}
		>
			{label}
		</span>
	)
}
