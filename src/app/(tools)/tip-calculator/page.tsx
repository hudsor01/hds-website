/**
 * Tip Calculator
 * Calculate tip amount and split bills among multiple people
 */

'use client';

import { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/calculators/CalculatorLayout';
import { CalculatorInput } from '@/components/calculators/CalculatorInput';
import { trackEvent } from '@/lib/analytics';
import { Receipt, Users, Percent } from 'lucide-react';

interface TipInputs {
  billAmount: number;
  tipPercent: number;
  customTip: number;
  splitCount: number;
}

const TIP_PRESETS = [
  { value: 15, label: '15%' },
  { value: 18, label: '18%' },
  { value: 20, label: '20%' },
  { value: 25, label: '25%' },
];

export default function TipCalculatorPage() {
  const [inputs, setInputs] = useState<TipInputs>({
    billAmount: 0,
    tipPercent: 20,
    customTip: 0,
    splitCount: 1,
  });

  const [useCustomTip, setUseCustomTip] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  const handleInputChange = (field: keyof TipInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs(prev => ({ ...prev, [field]: numValue }));
    setHasCalculated(true);
  };

  const selectTipPreset = (percent: number) => {
    setUseCustomTip(false);
    setInputs(prev => ({ ...prev, tipPercent: percent, customTip: 0 }));
    setHasCalculated(true);
  };

  const enableCustomTip = () => {
    setUseCustomTip(true);
    setInputs(prev => ({ ...prev, tipPercent: 0 }));
  };

  const results = useMemo(() => {
    const effectiveTipPercent = useCustomTip ? inputs.customTip : inputs.tipPercent;
    const tipAmount = inputs.billAmount * (effectiveTipPercent / 100);
    const totalAmount = inputs.billAmount + tipAmount;
    const perPersonBill = inputs.billAmount / inputs.splitCount;
    const perPersonTip = tipAmount / inputs.splitCount;
    const perPersonTotal = totalAmount / inputs.splitCount;

    return {
      tipAmount,
      totalAmount,
      perPersonBill,
      perPersonTip,
      perPersonTotal,
      effectiveTipPercent,
    };
  }, [inputs, useCustomTip]);

  const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Track when user interacts
  const trackUsage = () => {
    if (inputs.billAmount > 0) {
      trackEvent('calculator_used', {
        calculator_type: 'tip-calculator',
        tip_percent: results.effectiveTipPercent,
        split_count: inputs.splitCount,
        bill_amount: inputs.billAmount,
      });
    }
  };

  return (
    <CalculatorLayout
      title="Tip Calculator"
      description="Calculate the perfect tip and easily split bills among friends"
      icon={<Receipt className="h-8 w-8 text-cyan-600" />}
    >
      <div className="space-y-6">
        {/* Bill Amount */}
        <CalculatorInput
          label="Bill Amount"
          id="billAmount"
          type="number"
          min="0"
          step="0.01"
          value={inputs.billAmount || ''}
          onChange={(e) => handleInputChange('billAmount', e.target.value)}
          onBlur={trackUsage}
          prefix="$"
          helpText="Enter the total bill before tip"
          required
        />

        {/* Tip Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Select Tip Percentage
          </label>

          <div className="grid grid-cols-5 gap-2">
            {TIP_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => selectTipPreset(preset.value)}
                className={`py-3 px-2 rounded-lg text-sm font-semibold transition-colors ${
                  !useCustomTip && inputs.tipPercent === preset.value
                    ? 'bg-cyan-600 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={enableCustomTip}
              className={`py-3 px-2 rounded-lg text-sm font-semibold transition-colors ${
                useCustomTip
                  ? 'bg-cyan-600 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Custom
            </button>
          </div>

          {useCustomTip && (
            <CalculatorInput
              label=""
              id="customTip"
              type="number"
              min="0"
              max="100"
              step="1"
              value={inputs.customTip || ''}
              onChange={(e) => handleInputChange('customTip', e.target.value)}
              suffix="%"
              helpText="Enter custom tip percentage"
            />
          )}
        </div>

        {/* Split Bill */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Users className="w-4 h-4" />
            Split Bill
          </label>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setInputs(prev => ({ ...prev, splitCount: Math.max(1, prev.splitCount - 1) }))}
              className="w-12 h-12 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 text-xl font-bold"
              disabled={inputs.splitCount <= 1}
            >
              -
            </button>
            <div className="flex-1 text-center">
              <div className="text-3xl font-bold text-foreground">{inputs.splitCount}</div>
              <div className="text-sm text-muted-foreground">
                {inputs.splitCount === 1 ? 'person' : 'people'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setInputs(prev => ({ ...prev, splitCount: Math.min(20, prev.splitCount + 1) }))}
              className="w-12 h-12 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 text-xl font-bold"
              disabled={inputs.splitCount >= 20}
            >
              +
            </button>
          </div>
        </div>

        {/* Results */}
        {hasCalculated && inputs.billAmount > 0 && (
          <div className="space-y-4 border-t border-border pt-6">
            {/* Per Person (if splitting) */}
            {inputs.splitCount > 1 && (
              <div className="rounded-lg bg-cyan-50 dark:bg-cyan-900/20 p-6">
                <h4 className="text-sm font-medium text-cyan-700 dark:text-cyan-300 mb-4">
                  Per Person ({inputs.splitCount} people)
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Bill</div>
                    <div className="text-lg font-semibold text-foreground">
                      {formatCurrency(results.perPersonBill)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Tip</div>
                    <div className="text-lg font-semibold text-foreground">
                      {formatCurrency(results.perPersonTip)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Total</div>
                    <div className="text-xl font-bold text-cyan-600">
                      {formatCurrency(results.perPersonTotal)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Total Summary */}
            <div className="rounded-lg border border-border p-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">
                Total Summary
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Bill Amount</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(inputs.billAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Tip ({results.effectiveTipPercent}%)
                    <Percent className="w-3 h-3" />
                  </span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(results.tipAmount)}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-cyan-600">
                    {formatCurrency(results.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Reference */}
            <div className="rounded-lg bg-muted/50 p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Quick Reference for {formatCurrency(inputs.billAmount)}
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center">
                {TIP_PRESETS.map((preset) => {
                  const tip = inputs.billAmount * (preset.value / 100);
                  return (
                    <div key={preset.value} className="p-2">
                      <div className="text-xs text-muted-foreground">{preset.label}</div>
                      <div className="text-sm font-semibold text-foreground">
                        {formatCurrency(tip)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Educational Content */}
      <div className="mt-8 space-y-4 border-t pt-8 dark:border-border">
        <h3 className="text-lg font-semibold text-foreground dark:text-white">
          Tipping Guide
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4 dark:border-border">
            <h4 className="mb-2 font-semibold text-foreground dark:text-white">
              Restaurant Service
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              15-20% is standard. 20%+ for excellent service. Tip on pre-tax amount.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 dark:border-border">
            <h4 className="mb-2 font-semibold text-foreground dark:text-white">
              Delivery & Takeout
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              15-20% for delivery. 10-15% for takeout if they prepared it well.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 dark:border-border">
            <h4 className="mb-2 font-semibold text-foreground dark:text-white">
              Bar Service
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              $1-2 per drink or 15-20% of tab. More for complex cocktails.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 dark:border-border">
            <h4 className="mb-2 font-semibold text-foreground dark:text-white">
              Large Parties
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Many places add 18-20% gratuity for groups of 6+. Check your bill!
            </p>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
