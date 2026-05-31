/**
 * Time Card / Hours Calculator
 * Clock-in/out rows with breaks, overtime split, and optional pay.
 */

'use client'

import { Plus, X } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { CalculatorInput } from '@/components/calculators/CalculatorInput'
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import { calculateTimecard } from '@/lib/timecard-calculator'

const USD = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD'
})

interface Row {
	id: string
	clockIn: string
	clockOut: string
	breakMinutes: string
	overnight: boolean
}

let rowSeq = 0
function newRow(): Row {
	rowSeq += 1
	return {
		id: `row-${rowSeq}`,
		clockIn: '',
		clockOut: '',
		breakMinutes: '',
		overnight: false
	}
}

const fmtHours = (h: number) => `${h.toFixed(2)} h`

export default function TimeCardCalculatorClient() {
	const [rows, setRows] = useState<Row[]>(() => [newRow(), newRow()])
	const [rate, setRate] = useState('')
	const [threshold, setThreshold] = useState('40')
	const thresholdFieldId = useId()

	const result = useMemo(() => {
		return calculateTimecard({
			entries: rows.map(r => ({
				clockIn: r.clockIn,
				clockOut: r.clockOut,
				breakMinutes: Number.parseFloat(r.breakMinutes),
				overnight: r.overnight
			})),
			hourlyRate: Number.parseFloat(rate),
			overtimeThresholdHours: Number.parseFloat(threshold)
		})
	}, [rows, rate, threshold])

	const hasResult = result.totalHours > 0

	const updateRow = (id: string, patch: Partial<Row>) => {
		setRows(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)))
	}
	const addRow = () => setRows(prev => [...prev, newRow()])
	const removeRow = (id: string) =>
		setRows(prev => (prev.length > 1 ? prev.filter(r => r.id !== id) : prev))

	const formSlot = (
		<div className="space-y-comfortable">
			<div className="space-y-3">
				{rows.map((row, index) => (
					<div
						key={row.id}
						className="rounded-lg border border-border bg-surface-raised p-3"
					>
						<div className="flex items-center justify-between mb-2">
							<span className="text-xs font-medium text-muted-foreground">
								Day {index + 1}
								{(result.perDay[index] ?? 0) > 0
									? ` - ${fmtHours(result.perDay[index] ?? 0)}`
									: ''}
							</span>
							{rows.length > 1 && (
								<button
									type="button"
									onClick={() => removeRow(row.id)}
									className="text-muted-foreground hover:text-destructive-text"
									aria-label={`Remove day ${index + 1}`}
								>
									<X className="h-4 w-4" />
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
							/>
							<CalculatorInput
								id={`${row.id}-out`}
								label="Out"
								type="time"
								value={row.clockOut}
								onChange={event =>
									updateRow(row.id, { clockOut: event.target.value })
								}
							/>
							<CalculatorInput
								id={`${row.id}-break`}
								label="Break (min)"
								type="number"
								inputMode="numeric"
								value={row.breakMinutes}
								onChange={event =>
									updateRow(row.id, { breakMinutes: event.target.value })
								}
								placeholder="0"
							/>
						</div>
					</div>
				))}
				<button
					type="button"
					onClick={addRow}
					className="flex items-center gap-tight text-sm text-accent hover:text-accent/80"
				>
					<Plus className="h-4 w-4" />
					Add a day
				</button>
			</div>

			<fieldset className="space-y-content border-t border-border pt-comfortable">
				<legend className="text-sm font-semibold text-foreground">
					Pay (optional)
				</legend>
				<div className="grid grid-cols-2 gap-content">
					<CalculatorInput
						id="timecard-rate"
						label="Hourly rate"
						type="number"
						inputMode="decimal"
						prefix="$"
						value={rate}
						onChange={event => setRate(event.target.value)}
						placeholder="20"
					/>
					<CalculatorInput
						id={thresholdFieldId}
						label="Overtime after"
						type="number"
						inputMode="decimal"
						suffix="h/wk"
						value={threshold}
						onChange={event => setThreshold(event.target.value)}
						placeholder="40"
						helpText="Hours above this are paid at 1.5x."
					/>
				</div>
			</fieldset>
		</div>
	)

	const resultSlot = hasResult ? (
		<div className="rounded-xl border border-border bg-surface-raised p-6 space-y-3">
			<div>
				<div className="text-xs text-muted-foreground">Total hours</div>
				<div className="text-3xl font-bold text-accent tabular-nums">
					{fmtHours(result.totalHours)}
				</div>
			</div>
			<div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
				<div>
					<div className="text-xs text-muted-foreground">Regular</div>
					<div className="text-sm font-semibold text-foreground tabular-nums">
						{fmtHours(result.regularHours)}
					</div>
				</div>
				<div>
					<div className="text-xs text-muted-foreground">Overtime</div>
					<div className="text-sm font-semibold text-foreground tabular-nums">
						{fmtHours(result.overtimeHours)}
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
		</div>
	) : undefined

	return (
		<ToolPageLayout
			title="Time Card Calculator"
			description="Add up clock-in and clock-out times with breaks to get total hours, overtime, and gross pay. Works for payroll and billable freelance hours."
			columns="two"
			formSlot={formSlot}
			resultSlot={resultSlot}
			hasResult={hasResult}
			resultPlaceholder="Enter clock-in and clock-out times to total your hours"
		/>
	)
}
