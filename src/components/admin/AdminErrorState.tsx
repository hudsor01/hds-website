/**
 * Shared admin error-state card (Phase 13, ADMINERR-01..04).
 *
 * The ONE error UI the admin surfaces render when a read query returns its
 * failure variant (`AdminQueryResult` `ok: false` / `AdminDetailResult`
 * `status: 'error'`). It is the visible counterpart to the existing empty-state
 * cards: an empty state means "no data", this means "the read failed".
 *
 * Built on the already-vendored shadcn `Alert` primitive (`role="alert"`,
 * `destructive` variant), so it announces to assistive tech automatically and
 * matches the design system. Use across list pages, dashboard widgets, the
 * `/admin/emails` queue cards, and detail pages for a consistent error UX.
 *
 * Security (threat T-13-01, info disclosure): this component NEVER accepts or
 * renders a raw `Error` / exception object or `error.message`. Its only inputs
 * are a `resource` label and an optional generic `message`. The caught
 * exception lives in `logger.error` server-side only and must never cross into
 * the rendered UI. The default copy is fixed, generic, and emoji / em-dash /
 * en-dash free per CLAUDE.md.
 *
 * No `'use client'` here: the `Alert` it renders is the client boundary; this
 * wrapper is a plain (server-compatible) component and is also safe to render
 * from the two `'use client'` chart widgets.
 */
import { CircleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface AdminErrorStateProps {
	/**
	 * The resource that failed to load, e.g. "leads", "page analytics". Used in
	 * the default title. Falls back to "this data" when absent so the sentence
	 * reads cleanly.
	 */
	resource?: string
	/**
	 * Optional override for the body copy. Must be a fixed, generic string -
	 * never a raw exception message. Defaults to the generic retry prompt.
	 */
	message?: string
	/**
	 * Compact variant for inside a widget card body: drops the outer card
	 * chrome so the alert sits directly in the host card. When false / absent,
	 * the alert is wrapped in the admin card chrome matching the empty-state
	 * cards.
	 */
	inline?: boolean
}

const DEFAULT_BODY =
	'Something went wrong loading this data. Refresh to try again.'

export function AdminErrorState({
	resource,
	message,
	inline
}: AdminErrorStateProps) {
	const title = `Could not load ${resource ?? 'this data'}`

	const alert = (
		<Alert variant="destructive">
			<CircleAlert size={16} aria-hidden="true" />
			<AlertTitle>{title}</AlertTitle>
			<AlertDescription>{message ?? DEFAULT_BODY}</AlertDescription>
		</Alert>
	)

	if (inline) {
		return alert
	}

	return (
		<div className="rounded-xl border border-border bg-surface-raised p-8">
			{alert}
		</div>
	)
}
