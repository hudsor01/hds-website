/**
 * Tip Calculator
 * Calculate tip amount and split bills among multiple people
 */

'use client';

  import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
      icon={<Receipt className="h-8 w-8 text-primary" />}
    >
      <div className="space-y-comfortable">
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

          <div className="grid grid-cols-5 gap-tight">
            {TIP_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                type="button"
                onClick={() => selectTipPreset(preset.value)}
                variant={!useCustomTip && inputs.tipPercent === preset.value ? 'default' : 'muted'}
                size="sm"
                className="w-full text-sm font-semibold"
              >
                {preset.label}
              </Button>
            ))}
            <Button
              type="button"
              onClick={enableCustomTip}
              variant={useCustomTip ? 'default' : 'muted'}
              size="sm"
              className="w-full text-sm font-semibold"
            >
              Custom
            </Button>
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
          <label className="flex items-center gap-tight text-sm font-medium text-foreground">
            <Users className="w-4 h-4" />
            Split Bill
          </label>

          <div className="flex items-center gap-content">
            <Button
              type="button"
              onClick={() => setInputs(prev => ({ ...prev, splitCount: Math.max(1, prev.splitCount - 1) }))}
              variant="muted"
              size="icon-lg"
              className="size-12 text-xl font-bold"
              disabled={inputs.splitCount <= 1}
            >
              -
            </Button>
            <div className="flex-1 text-center">
              <div className="text-3xl font-bold text-foreground">{inputs.splitCount}</div>
              <div className="text-sm text-muted-foreground">
                {inputs.splitCount === 1 ? 'person' : 'people'}
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setInputs(prev => ({ ...prev, splitCount: Math.min(20, prev.splitCount + 1) }))}
              variant="muted"
              size="icon-lg"
              className="size-12 text-xl font-bold"
              disabled={inputs.splitCount >= 20}
            >
              +
            </Button>
          </div>
        </div>

        {/* Results */}
        {hasCalculated && inputs.billAmount > 0 && (
          <div className="space-y-content border-t border-border pt-6">
            {/* Per Person (if splitting) */}
            {inputs.splitCount > 1 && (
              <Card className="bg-accent/10 dark:bg-primary-hover/20">
                <h4 className="text-sm font-medium text-primary-hover dark:text-accent/80 mb-heading">
                  Per Person ({inputs.splitCount} people)
                </h4>
                <div className="grid grid-cols-3 gap-content">
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
                    <div className="text-xl font-bold text-primary">
                      {formatCurrency(results.perPersonTotal)}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Total Summary */}
            <Card>
              <h4 className="text-sm font-medium text-muted-foreground mb-heading">
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
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(results.totalAmount)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Reference */}
            <Card size="sm" className="bg-muted/50">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Quick Reference for {formatCurrency(inputs.billAmount)}
              </h4>
              <div className="grid grid-cols-4 gap-tight text-center">
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
            </Card>
          </div>
        )}
      </div>

      {/* Educational Content */}
      <div className="mt-heading space-y-content border-t pt-8 dark:border-border">
        <h3 className="text-lg font-semibold text-foreground dark:text-foreground">
          Tipping Guide
        </h3>

        <div className="grid gap-content sm:grid-cols-2">
          <Card size="sm">
            <h4 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Restaurant Service
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              15-20% is standard. 20%+ for excellent service. Tip on pre-tax amount.
            </p>
          </Card>

          <Card size="sm">
            <h4 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Delivery & Takeout
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              15-20% for delivery. 10-15% for takeout if they prepared it well.
            </p>
          </Card>

          <Card size="sm">
            <h4 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Bar Service
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              $1-2 per drink or 15-20% of tab. More for complex cocktails.
            </p>
          </Card>

          <Card size="sm">
            <h4 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Large Parties
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Many places add 18-20% gratuity for groups of 6+. Check your bill!
            </p>
          </Card>
        </div>
      </div>
    </CalculatorLayout>
  );
}
