/**
 * Phase 05 status filter primitive (server component).
 *
 * Shared by the four admin ops list pages -- `/admin/leads`,
 * `/admin/leads/calculator`, `/admin/newsletter`, `/admin/emails` -- so each
 * resource gets the same chip-row UI without duplicating CSS or markup. The
 * row is a single `<form method="get" action={baseHref}>` of `<button>`
 * chips, one per option. Submitting a chip fires a plain GET round-trip; no
 * client JS, no `useState`, no router hooks.
 *
 * The "All" chip submits with NO `name` attribute (via per-button
 * `formAction={baseHref}`) so the resulting URL omits `?status` entirely
 * instead of producing a dangling `?status=`. Every other chip submits with
 * `name="status" value={option.value}` so the URL becomes
 * `{baseHref}?status={value}`.
 *
 * The active chip is marked with `aria-current="page"` (same idiom the
 * Sidebar uses for the active nav item) and gets a slightly heavier visual
 * weight via foreground text + surface-base background.
 */

export type StatusFilterOption = {
	value: string | null
	label: string
	count?: number
}

export interface StatusFilterBarProps {
	baseHref: string
	current: string | null
	options: StatusFilterOption[]
	legend?: string
}

const CHIP_BASE =
	'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-border transition-smooth'
const CHIP_INACTIVE =
	'text-muted-foreground bg-surface-raised hover:bg-surface-base'
const CHIP_ACTIVE = 'text-foreground bg-surface-base'

export function StatusFilterBar({
	baseHref,
	current,
	options,
	legend
}: StatusFilterBarProps) {
	return (
		<form method="get" action={baseHref}>
			<fieldset className="flex flex-wrap items-center gap-2">
				<legend className="sr-only">{legend ?? 'Filter by status'}</legend>
				{options.map(option => {
					const isActive = option.value === current
					const stateClass = isActive ? CHIP_ACTIVE : CHIP_INACTIVE
					const label = `${option.label}${typeof option.count === 'number' ? ` (${option.count})` : ''}`
					const key = option.value ?? '__all__'
					if (option.value === null) {
						return (
							<button
								key={key}
								type="submit"
								formAction={baseHref}
								aria-current={isActive ? 'page' : undefined}
								className={`${CHIP_BASE} ${stateClass}`}
							>
								{label}
							</button>
						)
					}
					return (
						<button
							key={key}
							type="submit"
							name="status"
							value={option.value}
							aria-current={isActive ? 'page' : undefined}
							className={`${CHIP_BASE} ${stateClass}`}
						>
							{label}
						</button>
					)
				})}
			</fieldset>
		</form>
	)
}
