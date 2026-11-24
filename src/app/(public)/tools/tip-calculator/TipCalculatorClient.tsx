/**
 * Tip Calculator
 * Calculate tip amount and split bills among multiple people
 */

'use client'

import { Percent, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CalculatorInput } from '@/components/calculators/CalculatorInput'
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import { Card } from '@/components/ui/card'
import { trackEvent } from '@/lib/analytics'
import {
	calculateTip,
	fromCents,
	isValidTipPercent,
	MAX_SPLIT,
	MIN_SPLIT,
	tipCentsFor
} from '@/lib/tip-calculator'
import { formatCurrency } from '@/lib/utils'

const TIP_PRESETS = [
	{ value: 15, label: '15%' },
	{ value: 18, label: '18%' },
	{ value: 20, label: '20%' },
	{ value: 25, label: '25%' }
]

const PRESET_BUTTON_BASE =
	'py-3 px-2 rounded-lg text-sm font-semibold transition-colors'
const PRESET_BUTTON_ACTIVE = 'bg-accent text-accent-foreground'
const PRESET_BUTTON_IDLE = 'bg-muted text-muted-foreground hover:bg-muted/80'
const STEPPER_BUTTON =
	'w-12 h-12 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 text-xl font-bold transition-colors'

/** Accepts an empty field or a finite number inside [min, max]. */
function isAcceptedNumber(raw: string, min: number, max: number): boolean {
	if (raw === '') {
		return true
	}
	const value = Number(raw)
	return Number.isFinite(value) && value >= min && value <= max
}

function parseOrNull(raw: string): number | null {
	if (raw === '') {
		return null
	}
	const value = Number(raw)
	return Number.isFinite(value) ? value : null
}

export default function TipCalculatorClient() {
	const [billInput, setBillInput] = useState('')
	const [presetPercent, setPresetPercent] = useState(20)
	const [useCustomTip, setUseCustomTip] = useState(false)
	const [customTipInput, setCustomTipInput] = useState('')
	const [splitCount, setSplitCount] = useState(MIN_SPLIT)

	const billAmount = parseOrNull(billInput)
	const customTip = parseOrNull(customTipInput)
	const effectiveTipPercent = useCustomTip ? customTip : presetPercent

	const result = useMemo(() => {
		if (billAmount === null || billAmount <= 0) {
			return null
		}
		if (effectiveTipPercent === null) {
			return null
		}
		return calculateTip({
			billAmount,
			tipPercent: effectiveTipPercent,
			splitCount
		})
	}, [billAmount, effectiveTipPercent, splitCount])

	const handleBillChange = (raw: string) => {
		if (isAcceptedNumber(raw, 0, Number.POSITIVE_INFINITY)) {
			setBillInput(raw)
		}
	}

	const handleCustomTipChange = (raw: string) => {
		if (raw === '' || isValidTipPercent(Number(raw))) {
			setCustomTipInput(raw)
		}
	}

	const selectTipPreset = (percent: number) => {
		setUseCustomTip(false)
		setPresetPercent(percent)
		setCustomTipInput('')
	}

	const trackUsage = () => {
		if (result) {
			trackEvent('calculator_used', {
				calculator_type: 'tip-calculator',
				tip_percent: effectiveTipPercent,
				split_count: splitCount,
				bill_amount: fromCents(result.billCents)
			})
		}
	}

	const formSlot = (
		<div className="space-y-comfortable">
			{/* Bill Amount */}
			<CalculatorInput
				label="Bill Amount"
				id="billAmount"
				type="number"
				inputMode="decimal"
				min="0"
				step="0.01"
				value={billInput}
				onChange={e => handleBillChange(e.target.value)}
				onBlur={trackUsage}
				prefix="$"
				helpText="Enter the bill before tax and tip"
				required
			/>

			{/* Tip Selection */}
			<fieldset className="space-y-3">
				<legend className="block text-sm font-medium text-foreground">
					Select Tip Percentage
				</legend>

				<div className="grid grid-cols-5 gap-2">
					{TIP_PRESETS.map(preset => {
						const isActive = !useCustomTip && presetPercent === preset.value
						return (
							<button
								key={preset.value}
								type="button"
								aria-pressed={isActive}
								onClick={() => selectTipPreset(preset.value)}
								className={`${PRESET_BUTTON_BASE} ${
									isActive ? PRESET_BUTTON_ACTIVE : PRESET_BUTTON_IDLE
								}`}
							>
								{preset.label}
							</button>
						)
					})}
					<button
						type="button"
						aria-pressed={useCustomTip}
						onClick={() => setUseCustomTip(true)}
						className={`${PRESET_BUTTON_BASE} ${
							useCustomTip ? PRESET_BUTTON_ACTIVE : PRESET_BUTTON_IDLE
						}`}
					>
						Custom
					</button>
				</div>

				{useCustomTip && (
					<CalculatorInput
						label="Custom tip"
						id="customTip"
						type="number"
						inputMode="decimal"
						min="0"
						max="100"
						step="0.01"
						value={customTipInput}
						onChange={e => handleCustomTipChange(e.target.value)}
						onBlur={trackUsage}
						suffix="%"
						helpText="Enter a tip from 0 to 100%"
					/>
				)}
			</fieldset>

			{/* Split Bill */}
			<fieldset className="space-y-3">
				<legend className="flex items-center gap-2 text-sm font-medium text-foreground">
					<Users className="w-4 h-4" aria-hidden="true" />
					Split Bill
				</legend>

				<div className="flex items-center gap-4">
					<button
						type="button"
						aria-label="Remove a person"
						onClick={() => setSplitCount(prev => Math.max(MIN_SPLIT, prev - 1))}
						className={STEPPER_BUTTON}
						disabled={splitCount <= MIN_SPLIT}
					>
						-
					</button>
					<div className="flex-1 text-center">
						<div className="text-3xl font-bold text-foreground">
							{splitCount}
						</div>
						<div className="text-sm text-muted-foreground">
							{splitCount === 1 ? 'person' : 'people'}
						</div>
					</div>
					<button
						type="button"
						aria-label="Add a person"
						onClick={() => setSplitCount(prev => Math.min(MAX_SPLIT, prev + 1))}
						className={STEPPER_BUTTON}
						disabled={splitCount >= MAX_SPLIT}
					>
						+
					</button>
				</div>
			</fieldset>

			{/* Results */}
			<div aria-live="polite">
				{result && (
					<div className="space-y-4 border-t border-border pt-6">
						{/* Per Person (if splitting) */}
						{result.splitCount > 1 && (
							<Card className="bg-accent/10 border-accent/20">
								<h2 className="text-sm font-medium text-accent mb-4">
									Per Person ({result.splitCount} people)
								</h2>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-center">
										<div className="text-sm text-muted-foreground mb-1">
											Bill
										</div>
										<div className="text-lg font-semibold text-foreground">
											{formatCurrency(fromCents(result.perPersonBillCents))}
										</div>
									</div>
									<div className="text-center">
										<div className="text-sm text-muted-foreground mb-1">
											Tip
										</div>
										<div className="text-lg font-semibold text-foreground">
											{formatCurrency(fromCents(result.perPersonTipCents))}
										</div>
									</div>
									<div className="text-center">
										<div className="text-sm text-muted-foreground mb-1">
											Total
										</div>
										<div className="text-xl font-bold text-accent">
											{formatCurrency(fromCents(result.perPersonTotalCents))}
										</div>
									</div>
								</div>
								{result.remainderCents > 0 && (
									<p className="mt-4 text-xs text-muted-foreground text-center">
										{result.remainderCents}{' '}
										{result.remainderCents === 1 ? 'person pays' : 'people pay'}{' '}
										$0.01 more so the total comes to{' '}
										{formatCurrency(fromCents(result.totalCents))}.
									</p>
								)}
							</Card>
						)}

						{/* Total Summary */}
						<Card>
							<h2 className="text-sm font-medium text-muted-foreground mb-4">
								Total Summary
							</h2>
							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">
										Bill Amount
									</span>
									<span className="text-sm font-medium text-foreground">
										{formatCurrency(fromCents(result.billCents))}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground flex items-center gap-1">
										Tip ({effectiveTipPercent}%)
										<Percent className="w-3 h-3" aria-hidden="true" />
									</span>
									<span className="text-sm font-medium text-foreground">
										{formatCurrency(fromCents(result.tipCents))}
									</span>
								</div>
								<div className="border-t border-border pt-3 flex justify-between items-center">
									<span className="font-semibold text-foreground">
										Bill plus tip
									</span>
									<span className="text-2xl font-bold text-accent">
										{formatCurrency(fromCents(result.totalCents))}
									</span>
								</div>
							</div>
						</Card>

						{/* Quick Reference */}
						<Card size="sm" className="bg-muted/30">
							<h2 className="text-sm font-medium text-muted-foreground mb-3">
								Quick Reference for{' '}
								{formatCurrency(fromCents(result.billCents))}
							</h2>
							<div className="grid grid-cols-4 gap-2 text-center">
								{TIP_PRESETS.map(preset => (
									<div key={preset.value} className="p-2">
										<div className="text-xs text-muted-foreground">
											{preset.label}
										</div>
										<div className="text-sm font-semibold text-foreground">
											{formatCurrency(
												fromCents(tipCentsFor(result.billCents, preset.value))
											)}
										</div>
									</div>
								))}
							</div>
						</Card>
					</div>
				)}
			</div>

			{/* Educational Content */}
			<div className="mt-8 space-y-4 border-t border-border pt-8">
				<h2 className="text-lg font-semibold text-foreground">Tipping Guide</h2>

				<div className="grid gap-4 sm:grid-cols-2">
					<Card size="sm">
						<h3 className="mb-2 font-semibold text-foreground text-sm">
							Restaurant Service
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							15 to 20% is standard, on the pre-tax amount. Tip more for
							excellent service.
						</p>
					</Card>

					<Card size="sm">
						<h3 className="mb-2 font-semibold text-foreground text-sm">
							Delivery & Takeout
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							10 to 15% of the bill for delivery. Takeout carries no obligation,
							but about 10% is a good thank you for extra service.
						</p>
					</Card>

					<Card size="sm">
						<h3 className="mb-2 font-semibold text-foreground text-sm">
							Bar Service
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							$1 to $2 per drink or 15 to 20% of the tab.
						</p>
					</Card>

					<Card size="sm">
						<h3 className="mb-2 font-semibold text-foreground text-sm">
							Large Parties
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							Many places add an 18 to 20% gratuity for groups of 6 or more.
							Check your bill before you tip.
						</p>
					</Card>
				</div>
			</div>
		</div>
	)

	return (
		<ToolPageLayout
			title="Tip Calculator"
			description="Calculate the perfect tip and easily split bills among friends"
			columns="single"
			formSlot={formSlot}
		/>
	)
}
