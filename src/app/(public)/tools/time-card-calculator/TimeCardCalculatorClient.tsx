/**
 * Time Card / Hours Calculator
 * One workweek of clock-in/out rows with unpaid meal breaks, a weekly
 * overtime split and optional gross pay.
 */

'use client'

import { Plus, X } from 'lucide-react'
import { useId, useMemo, useRef, useState } from 'react'
import { CalculatorInput } from '@/components/calculators/CalculatorInput'
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import {
	calculateTimecard,
	type EntryError,
	formatHoursMinutes,
	MAX_WORKWEEK_DAYS,
	type TimecardResult
} from '@/lib/timecard-calculator'

interface Row {
	id: string
	clockIn: string
	clockOut: string
	breakMinutes: string
	overnight: boolean
}

type NumberField =
	| { ok: true; value: number | undefined }
	| { ok: false; message: string }

const USD = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD'
})

const INITIAL_ROW_COUNT = 2

const ENTRY_ERROR_MESSAGES: Record<EntryError, string> = {
	'invalid-time': 'Enter clock-in and clock-out as valid times.',
	'out-before-in':
		'Clock-out is before clock-in. Tick overnight if the shift ran past midnight.',
	'same-time':
		'Clock-in and clock-out are the same time. Enter a shift shorter than 24 hours.',
	'invalid-break': 'Enter the meal break as a number of minutes.',
	'negative-break': 'The meal break cannot be negative.',
	'break-too-long': 'The meal break is as long as the shift or longer.'
}

const BREAK_ERRORS: ReadonlySet<EntryError> = new Set([
	'invalid-break',
	'negative-break',
	'break-too-long'
])

const fmtHours = (minutes: number) =>
	`${(minutes / 60).toFixed(2)} h (${formatHoursMinutes(minutes)})`

function emptyRow(id: string): Row {
	return { id, clockIn: '', clockOut: '', breakMinutes: '', overnight: false }
}

/** Blank means "not entered"; anything else must be a finite number. */
function parseOptionalNumber(raw: string): number | undefined | null {
	const trimmed = raw.trim()
	if (trimmed === '') {
		return undefined
	}
	const value = Number(trimmed)
	return Number.isFinite(value) ? value : null
}

function parseThreshold(raw: string): NumberField {
	const value = parseOptionalNumber(raw)
	if (value === undefined || value === null || value <= 0) {
		return { ok: false, message: 'Enter overtime hours above 0, such as 40.' }
	}
	return { ok: true, value }
}

function parseRate(raw: string): NumberField {
	const value = parseOptionalNumber(raw)
	if (value === null) {
		return { ok: false, message: 'Enter the hourly rate as a number.' }
	}
	if (value !== undefined && value < 0) {
		return { ok: false, message: 'The hourly rate cannot be negative.' }
	}
	return { ok: true, value }
}

export default function TimeCardCalculatorClient() {
	// useId gives a prefix that matches between server and client HTML, so
	// every label points at its own input after hydration.
	const idPrefix = useId()
	const nextRowNumber = useRef(INITIAL_ROW_COUNT + 1)
	const [rows, setRows] = useState<Row[]>(() =>
		Array.from({ length: INITIAL_ROW_COUNT }, (_, i) =>
			emptyRow(`${idPrefix}-day-${i + 1}`)
		)
	)
	const [rate, setRate] = useState('')
	const [threshold, setThreshold] = useState('40')
	const thresholdFieldId = useId()
	const rateFieldId = useId()

	const { thresholdField, rateField, result } = useMemo(() => {
		const thresholdField = parseThreshold(threshold)
		const rateField = parseRate(rate)
		const result: TimecardResult | null = thresholdField.ok
			? calculateTimecard({
					entries: rows.map(r => {
						const breakMinutes = parseOptionalNumber(r.breakMinutes)
						return {
							clockIn: r.clockIn,
							clockOut: r.clockOut,
							breakMinutes: breakMinutes === null ? Number.NaN : breakMinutes,
							overnight: r.overnight
						}
					}),
					hourlyRate: rateField.ok ? rateField.value : undefined,
					overtimeThresholdHours: thresholdField.value
				})
			: null
		return { thresholdField, rateField, result }
	}, [rows, rate, threshold])

	const hasResult =
		result !== null && !result.hasErrors && result.totalMinutes > 0
	const atMaxDays = rows.length >= MAX_WORKWEEK_DAYS

	const updateRow = (id: string, patch: Partial<Row>) => {
		setRows(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)))
	}
	const addRow = () => {
		if (rows.length >= MAX_WORKWEEK_DAYS) {
			return
		}
		const id = `${idPrefix}-day-${nextRowNumber.current}`
		nextRowNumber.current += 1
		setRows(prev => [...prev, emptyRow(id)])
	}
	const removeRow = (id: string) =>
		setRows(prev => (prev.length > 1 ? prev.filter(r => r.id !== id) : prev))

	let resultPlaceholder =
		'Enter clock-in and clock-out times to total your hours'
	if (!thresholdField.ok) {
		resultPlaceholder = 'Enter an overtime threshold above 0 to see totals'
	} else if (result?.hasErrors) {
		resultPlaceholder = 'Fix the day marked in red to see your totals'
	}

	const formSlot = (
		<div className="space-y-comfortable">
			<div className="space-y-3">
				<div className="space-y-tight text-xs text-muted-foreground">
					<p>
						One workweek, up to {MAX_WORKWEEK_DAYS} days. Overtime is counted
						per workweek, so enter each week on its own.
					</p>
					<p>
						Enter only unpaid meal breaks, usually 30 minutes or more. Short
						rest breaks of 20 minutes or less count as paid time.
					</p>
				</div>
				{rows.map((row, index) => {
					const entry = result?.entries[index]
					const error = entry?.error ?? null
					const errorId = `${row.id}-error`
					const breakInvalid = error !== null && BREAK_ERRORS.has(error)
					const timeInvalid = error !== null && !breakInvalid
					return (
						<div
							key={row.id}
							className="rounded-lg border border-border bg-surface-raised p-3"
						>
							<div className="flex items-center justify-between mb-2">
								<span className="text-xs font-medium text-muted-foreground">
									Day {index + 1}
									{entry && entry.minutes > 0
										? ` - ${fmtHours(entry.minutes)}`
										: ''}
								</span>
								{rows.length > 1 && (
									<button
										type="button"
										onClick={() => removeRow(row.id)}
										className="text-muted-foreground hover:text-destructive-text"
										aria-label={`Remove day ${index + 1}`}
									>
										<X className="h-4 w-4" aria-hidden="true" />
									</button>
								)}
							</div>
							<div className="grid grid-cols-3 gap-2">
								<CalculatorInput
									id={`${row.id}-in`}
									label="In"
									type="time"
									value={row.clockIn}
									onChange={event =>
										updateRow(row.id, { clockIn: event.target.value })
									}
									aria-invalid={timeInvalid || undefined}
									aria-describedby={timeInvalid ? errorId : undefined}
								/>
								<CalculatorInput
									id={`${row.id}-out`}
									label="Out"
									type="time"
									value={row.clockOut}
									onChange={event =>
										updateRow(row.id, { clockOut: event.target.value })
									}
									aria-invalid={timeInvalid || undefined}
									aria-describedby={timeInvalid ? errorId : undefined}
								/>
								<CalculatorInput
									id={`${row.id}-break`}
									label="Unpaid meal break (min)"
									type="number"
									inputMode="numeric"
									min="0"
									value={row.breakMinutes}
									onChange={event =>
										updateRow(row.id, { breakMinutes: event.target.value })
									}
									placeholder="0"
									aria-invalid={breakInvalid || undefined}
									aria-describedby={breakInvalid ? errorId : undefined}
								/>
							</div>
							<label className="mt-2 flex items-center gap-tight text-xs text-muted-foreground">
								<input
									type="checkbox"
									checked={row.overnight}
									onChange={event =>
										updateRow(row.id, { overnight: event.target.checked })
									}
									className="size-4 accent-primary"
								/>
								Overnight shift (clock-out is the next day)
							</label>
							{error !== null && (
								<p
									id={errorId}
									role="alert"
									className="mt-2 text-xs text-destructive-text"
								>
									{ENTRY_ERROR_MESSAGES[error]}
								</p>
							)}
						</div>
					)
				})}
				<button
					type="button"
					onClick={addRow}
					disabled={atMaxDays}
					className="flex items-center gap-tight text-sm text-accent-text hover:underline underline-offset-4 disabled:cursor-not-allowed disabled:text-muted-foreground"
				>
					<Plus className="h-4 w-4" aria-hidden="true" />
					Add a day
				</button>
				{atMaxDays && (
					<p className="text-xs text-muted-foreground">
						{MAX_WORKWEEK_DAYS} days is one full workweek. Start a new card for
						the next week.
					</p>
				)}
			</div>

			<fieldset className="space-y-content border-t border-border pt-comfortable">
				<legend className="text-sm font-semibold text-foreground">
					Pay (optional)
				</legend>
				<div className="grid grid-cols-2 gap-content">
					<CalculatorInput
						id={rateFieldId}
						label="Hourly rate"
						type="number"
						inputMode="decimal"
						min="0"
						prefix="$"
						value={rate}
						onChange={event => setRate(event.target.value)}
						placeholder="20"
						error={rateField.ok ? undefined : rateField.message}
						aria-invalid={!rateField.ok || undefined}
					/>
					<CalculatorInput
						id={thresholdFieldId}
						label="Overtime after"
						type="number"
						inputMode="decimal"
						min="0"
						suffix="h/wk"
						value={threshold}
						onChange={event => setThreshold(event.target.value)}
						placeholder="40"
						helpText="Hours above this in the workweek are paid at 1.5x."
						error={thresholdField.ok ? undefined : thresholdField.message}
						aria-invalid={!thresholdField.ok || undefined}
						required
					/>
				</div>
			</fieldset>
		</div>
	)

	const resultSlot =
		hasResult && result ? (
			<div className="rounded-xl border border-border bg-surface-raised p-6 space-y-3">
				<div>
					<div className="text-xs text-muted-foreground">Total hours</div>
					<div className="text-3xl font-bold text-accent-text tabular-nums">
						{fmtHours(result.totalMinutes)}
					</div>
				</div>
				<div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
					<div>
						<div className="text-xs text-muted-foreground">Regular</div>
						<div className="text-sm font-semibold text-foreground tabular-nums">
							{fmtHours(result.regularMinutes)}
						</div>
					</div>
					<div>
						<div className="text-xs text-muted-foreground">Overtime</div>
						<div className="text-sm font-semibold text-foreground tabular-nums">
							{fmtHours(result.overtimeMinutes)}
						</div>
					</div>
				</div>
				{result.totalPay !== null && (
					<div className="border-t border-border pt-3">
						<div className="text-xs text-muted-foreground">Gross pay</div>
						<div className="text-xl font-semibold text-foreground tabular-nums">
							{USD.format(result.totalPay)}
						</div>
						{result.overtimePay !== null && result.overtimePay > 0 && (
							<p className="mt-1 text-xs text-muted-foreground">
								Includes {USD.format(result.overtimePay)} overtime.
							</p>
						)}
					</div>
				)}
				<p className="border-t border-border pt-3 text-xs text-muted-foreground">
					This follows the federal weekly rule: hours over 40 in one workweek
					are paid at 1.5x. Some states, such as California, also require daily
					overtime. The federal regular rate can include nondiscretionary
					bonuses, which this tool does not add.
				</p>
			</div>
		) : undefined

	return (
		<ToolPageLayout
			title="Time Card Calculator"
			description="Add up clock-in and clock-out times with unpaid meal breaks to get total hours, overtime and gross pay. Works for one workweek of hourly pay or billable hours."
			columns="two"
			formSlot={formSlot}
			resultSlot={resultSlot}
			hasResult={hasResult}
			resultPlaceholder={resultPlaceholder}
		/>
	)
}
