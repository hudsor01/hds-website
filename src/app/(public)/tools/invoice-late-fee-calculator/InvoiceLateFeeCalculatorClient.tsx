/**
 * Invoice Late Fee Calculator
 * Flat or percentage-per-period late fees on an overdue invoice.
 */

'use client'

import { useId, useMemo, useState } from 'react'
import { CalculatorInput } from '@/components/calculators/CalculatorInput'
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import {
	calculateLateFee,
	type FeePeriod,
	type LateFeeMode
} from '@/lib/late-fee-calculator'

const USD = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD'
})

const PERIODS: ReadonlyArray<{ value: FeePeriod; label: string }> = [
	{ value: 'day', label: 'per day' },
	{ value: 'week', label: 'per week' },
	{ value: 'month', label: 'per month' }
]

/**
 * Days are whole, non-negative numbers. Rejecting anything else (a minus,
 * a decimal point, an exponent) keeps the previous value in the field.
 */
function acceptWholeDays(raw: string, set: (value: string) => void) {
	if (raw === '' || /^\d+$/.test(raw)) {
		set(raw)
	}
}

export default function InvoiceLateFeeCalculatorClient() {
	const [amount, setAmount] = useState('')
	const [mode, setMode] = useState<LateFeeMode>('percent')
	const [flatFee, setFlatFee] = useState('')
	const [percentRate, setPercentRate] = useState('')
	const [period, setPeriod] = useState<FeePeriod>('month')
	const [daysOverdue, setDaysOverdue] = useState('')
	const [grace, setGrace] = useState('')

	const modeFieldId = useId()
	const periodFieldId = useId()

	const amountNum = Number.parseFloat(amount)
	const daysNum = Number.parseInt(daysOverdue, 10)
	const hasInputs = Number.isFinite(amountNum) && Number.isFinite(daysNum)

	const result = useMemo(
		() =>
			calculateLateFee({
				amount: amountNum,
				mode,
				flatFee: Number.parseFloat(flatFee),
				percentRate: Number.parseFloat(percentRate),
				period,
				daysOverdue: daysNum,
				gracePeriodDays: Number.parseInt(grace, 10)
			}),
		[amountNum, mode, flatFee, percentRate, period, daysNum, grace]
	)

	const hasResult = hasInputs

	// The fee-defining input for the active mode. When it's blank we show
	// a prompt instead of a misleading "$0.00 fee / N days overdue" pair.
	const feeInputMissing =
		mode === 'percent'
			? !Number.isFinite(Number.parseFloat(percentRate))
			: !Number.isFinite(Number.parseFloat(flatFee))
	const graceNum = Number.parseInt(grace, 10)
	const hasGrace = Number.isFinite(graceNum) && graceNum > 0

	const formSlot = (
		<div className="space-y-comfortable">
			<CalculatorInput
				id="latefee-amount"
				label="Invoice amount"
				type="number"
				inputMode="decimal"
				prefix="$"
				value={amount}
				onChange={event => setAmount(event.target.value)}
				placeholder="1000"
			/>

			<div>
				<label
					htmlFor={modeFieldId}
					className="block text-sm font-medium text-foreground mb-subheading"
				>
					Fee type
				</label>
				<select
					id={modeFieldId}
					value={mode}
					onChange={event => setMode(event.target.value as LateFeeMode)}
					className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
				>
					<option value="percent">Percentage of the invoice</option>
					<option value="flat">Flat one-time fee</option>
				</select>
			</div>

			{mode === 'flat' ? (
				<CalculatorInput
					id="latefee-flat"
					label="Flat fee"
					type="number"
					inputMode="decimal"
					prefix="$"
					value={flatFee}
					onChange={event => setFlatFee(event.target.value)}
					placeholder="25"
				/>
			) : (
				<div className="flex items-end gap-content">
					<div className="flex-1">
						<CalculatorInput
							id="latefee-rate"
							label="Rate"
							type="number"
							inputMode="decimal"
							suffix="%"
							value={percentRate}
							onChange={event => setPercentRate(event.target.value)}
							placeholder="1.5"
						/>
					</div>
					<div>
						<label htmlFor={periodFieldId} className="sr-only">
							Period
						</label>
						<select
							id={periodFieldId}
							value={period}
							onChange={event => setPeriod(event.target.value as FeePeriod)}
							className="rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground"
						>
							{PERIODS.map(p => (
								<option key={p.value} value={p.value}>
									{p.label}
								</option>
							))}
						</select>
					</div>
				</div>
			)}

			<div className="grid grid-cols-2 gap-content">
				<CalculatorInput
					id="latefee-days"
					label="Days overdue"
					type="number"
					inputMode="numeric"
					min="0"
					step="1"
					value={daysOverdue}
					onChange={event =>
						acceptWholeDays(event.target.value, setDaysOverdue)
					}
					placeholder="30"
				/>
				<CalculatorInput
					id="latefee-grace"
					label="Grace period (days)"
					type="number"
					inputMode="numeric"
					min="0"
					step="1"
					value={grace}
					onChange={event => acceptWholeDays(event.target.value, setGrace)}
					placeholder="0"
				/>
			</div>
		</div>
	)

	// Without an amount or the fee input for the active mode there is no
	// fee to show, so show only the prompt (not a misleading $0.00 total).
	const prompt =
		amountNum <= 0
			? 'Enter an invoice amount above $0 to calculate a fee.'
			: feeInputMissing
				? mode === 'percent'
					? 'Enter a rate to calculate the fee.'
					: 'Enter a flat fee to calculate the fee.'
				: null

	const resultSlot = hasResult ? (
		<div className="rounded-xl border border-border bg-surface-raised p-6 space-y-3">
			{prompt ? (
				<p className="text-sm text-muted-foreground">{prompt}</p>
			) : (
				<>
					<div>
						<div className="text-xs text-muted-foreground">Late fee</div>
						<div className="text-3xl font-bold text-accent tabular-nums">
							{USD.format(result.lateFee)}
						</div>
					</div>
					<div className="border-t border-border pt-3">
						<div className="text-xs text-muted-foreground">Total now owed</div>
						<div className="text-xl font-semibold text-foreground tabular-nums">
							{USD.format(result.total)}
						</div>
					</div>
					<p className="text-xs text-muted-foreground">
						{result.effectiveDays === 0
							? hasGrace && daysNum > 0
								? 'Still within the grace period, so no fee applies.'
								: 'The invoice is not overdue, so no fee applies.'
							: `Based on ${result.effectiveDays} chargeable day${
									result.effectiveDays === 1 ? '' : 's'
								} overdue.`}
					</p>
					<p className="text-xs text-muted-foreground">
						{mode === 'percent'
							? 'Simple interest, with a month counted as 30 days, so 1.5% a month over 365 days comes to 18.25%. The fee is charged only on days after the grace period.'
							: 'A one-time fee, charged once the invoice is past the grace period.'}
					</p>
				</>
			)}
			<p className="border-t border-border pt-3 text-xs text-muted-foreground">
				Late fee and interest limits vary by state and by contract. In Texas, if
				no rate was agreed, the default is 6% a year starting on the 30th day
				after the due date (Tex. Fin. Code 302.002). The general cap is 10% a
				year unless another law allows more (302.001).
			</p>
		</div>
	) : undefined

	return (
		<ToolPageLayout
			title="Invoice Late Fee Calculator"
			description="Work out the late fee and total owed on an overdue invoice, using a flat fee or a percentage rate per day, week or month."
			columns="two"
			formSlot={formSlot}
			resultSlot={resultSlot}
			hasResult={hasResult}
			resultPlaceholder="Enter an invoice amount and days overdue"
		/>
	)
}
