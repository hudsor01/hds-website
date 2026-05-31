/**
 * Profit Margin & Markup Calculator
 * Cost + price to margin %, markup %, and profit; plus price-for-margin.
 */

'use client'

import { useMemo, useState } from 'react'
import { CalculatorInput } from '@/components/calculators/CalculatorInput'
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import { calculateMargin, priceForMargin } from '@/lib/margin-calculator'

const USD = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD'
})

function pct(value: number | null): string {
	return value === null ? 'n/a' : `${value.toFixed(2)}%`
}

interface ResultRowProps {
	label: string
	value: string
	emphasis?: boolean
}

function ResultRow({ label, value, emphasis }: ResultRowProps) {
	return (
		<div className="flex items-center justify-between border-b border-border py-3 last:border-0">
			<span className="text-sm text-muted-foreground">{label}</span>
			<span
				className={
					emphasis
						? 'text-lg font-bold text-accent tabular-nums'
						: 'text-sm font-semibold text-foreground tabular-nums'
				}
			>
				{value}
			</span>
		</div>
	)
}

export default function ProfitMarginCalculatorClient() {
	const [cost, setCost] = useState('')
	const [price, setPrice] = useState('')
	const [targetMargin, setTargetMargin] = useState('')

	const costNum = Number.parseFloat(cost)
	const priceNum = Number.parseFloat(price)
	// Negative cost/price are nonsensical (they produce impossible >100%
	// margins). Gate on non-negative so a stray minus doesn't render a
	// styled, valid-looking-but-wrong result. `min="0"` on the inputs
	// blocks the common case; this guards typed/pasted negatives too.
	const hasInputs =
		Number.isFinite(costNum) &&
		Number.isFinite(priceNum) &&
		costNum >= 0 &&
		priceNum >= 0

	const result = useMemo(
		() => calculateMargin(costNum, priceNum),
		[costNum, priceNum]
	)

	const targetMarginNum = Number.parseFloat(targetMargin)
	const suggestedPrice = useMemo(() => {
		if (!Number.isFinite(costNum) || !Number.isFinite(targetMarginNum)) {
			return null
		}
		return priceForMargin(costNum, targetMarginNum)
	}, [costNum, targetMarginNum])

	const hasResult = hasInputs

	const formSlot = (
		<div className="space-y-comfortable">
			<div className="space-y-content">
				<CalculatorInput
					id="margin-cost"
					label="Cost"
					type="number"
					inputMode="decimal"
					prefix="$"
					value={cost}
					onChange={event => setCost(event.target.value)}
					placeholder="60"
				/>
				<CalculatorInput
					id="margin-price"
					label="Selling price"
					type="number"
					inputMode="decimal"
					prefix="$"
					value={price}
					onChange={event => setPrice(event.target.value)}
					placeholder="100"
				/>
			</div>

			<fieldset className="space-y-content border-t border-border pt-comfortable">
				<legend className="text-sm font-semibold text-foreground">
					Reverse: price for a target margin
				</legend>
				<CalculatorInput
					id="margin-target"
					label="Target margin"
					type="number"
					inputMode="decimal"
					suffix="%"
					value={targetMargin}
					onChange={event => setTargetMargin(event.target.value)}
					placeholder="40"
					helpText={
						suggestedPrice !== null
							? `Sell at ${USD.format(suggestedPrice)} to hit that margin on your cost.`
							: 'Enter a cost and a target margin under 100%.'
					}
				/>
			</fieldset>
		</div>
	)

	const resultSlot = hasResult ? (
		<div className="rounded-xl border border-border bg-surface-raised p-6">
			<ResultRow label="Profit" value={USD.format(result.profit)} emphasis />
			<ResultRow label="Gross margin" value={pct(result.marginPercent)} />
			<ResultRow label="Markup" value={pct(result.markupPercent)} />
			{Math.round(result.profit * 100) < 0 && (
				<p className="mt-3 text-xs text-destructive-text">
					This price is below cost, so you would take a loss.
				</p>
			)}
		</div>
	) : undefined

	return (
		<ToolPageLayout
			title="Profit Margin & Markup Calculator"
			description="Enter your cost and selling price to see profit, gross margin, and markup. Margin is profit over price; markup is profit over cost."
			columns="two"
			formSlot={formSlot}
			resultSlot={resultSlot}
			hasResult={hasResult}
			resultPlaceholder="Enter a cost and selling price to see your margin"
		/>
	)
}
