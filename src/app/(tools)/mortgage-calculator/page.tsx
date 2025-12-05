/**
 * Mortgage Calculator
 * Calculate monthly mortgage payments and total costs
 */

'use client';

import { useState } from 'react';
import { CalculatorLayout } from '@/components/calculators/CalculatorLayout';
import { CalculatorInput } from '@/components/calculators/CalculatorInput';
import { CalculatorResults } from '@/components/calculators/CalculatorResults';
import { trackEvent } from '@/lib/analytics';
import { Home } from 'lucide-react';

interface MortgageInputs {
  homePrice: number;
  downPayment: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTerm: number;
  propertyTax: number;
  homeInsurance: number;
  pmi: number;
  hoaFees: number;
}

interface MortgageResults {
  monthlyPrincipalInterest: string;
  monthlyPropertyTax: string;
  monthlyInsurance: string;
  monthlyPMI: string;
  monthlyHOA: string;
  totalMonthlyPayment: string;
  loanAmount: string;
  totalInterest: string;
  totalPayments: string;
}

export default function MortgageCalculatorPage() {
  const [inputs, setInputs] = useState<MortgageInputs>({
    homePrice: 350000,
    downPayment: 70000,
    downPaymentPercent: 20,
    interestRate: 6.5,
    loanTerm: 30,
    propertyTax: 3500,
    homeInsurance: 1200,
    pmi: 0,
    hoaFees: 0,
  });

  const [results, setResults] = useState<MortgageResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [usePercent, setUsePercent] = useState(true);

  const handleInputChange = (field: keyof MortgageInputs, value: string) => {
    const numValue = parseFloat(value) || 0;

    if (field === 'downPaymentPercent') {
      const downPayment = (inputs.homePrice * numValue) / 100;
      setInputs(prev => ({
        ...prev,
        downPaymentPercent: numValue,
        downPayment: Math.round(downPayment),
        pmi: numValue < 20 ? 100 : 0, // Auto-add PMI if down payment < 20%
      }));
    } else if (field === 'downPayment') {
      const percent = (numValue / inputs.homePrice) * 100;
      setInputs(prev => ({
        ...prev,
        downPayment: numValue,
        downPaymentPercent: Math.round(percent * 10) / 10,
        pmi: percent < 20 ? 100 : 0,
      }));
    } else if (field === 'homePrice') {
      const downPayment = usePercent
        ? (numValue * inputs.downPaymentPercent) / 100
        : inputs.downPayment;
      const percent = usePercent
        ? inputs.downPaymentPercent
        : (inputs.downPayment / numValue) * 100;
      setInputs(prev => ({
        ...prev,
        homePrice: numValue,
        downPayment: Math.round(downPayment),
        downPaymentPercent: Math.round(percent * 10) / 10,
      }));
    } else {
      setInputs(prev => ({ ...prev, [field]: numValue }));
    }
  };

  const calculateMortgage = () => {
    const loanAmount = inputs.homePrice - inputs.downPayment;
    const monthlyRate = inputs.interestRate / 100 / 12;
    const numberOfPayments = inputs.loanTerm * 12;

    // Monthly P&I payment formula: M = P[r(1+r)^n]/[(1+r)^n-1]
    let monthlyPrincipalInterest = 0;
    if (monthlyRate > 0) {
      monthlyPrincipalInterest =
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
      monthlyPrincipalInterest = loanAmount / numberOfPayments;
    }

    const monthlyPropertyTax = inputs.propertyTax / 12;
    const monthlyInsurance = inputs.homeInsurance / 12;
    const monthlyPMI = inputs.pmi;
    const monthlyHOA = inputs.hoaFees;

    const totalMonthlyPayment =
      monthlyPrincipalInterest + monthlyPropertyTax + monthlyInsurance + monthlyPMI + monthlyHOA;

    const totalPayments = monthlyPrincipalInterest * numberOfPayments;
    const totalInterest = totalPayments - loanAmount;

    const formatCurrency = (num: number) =>
      `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    const calculatedResults: MortgageResults = {
      monthlyPrincipalInterest: formatCurrency(monthlyPrincipalInterest),
      monthlyPropertyTax: formatCurrency(monthlyPropertyTax),
      monthlyInsurance: formatCurrency(monthlyInsurance),
      monthlyPMI: formatCurrency(monthlyPMI),
      monthlyHOA: formatCurrency(monthlyHOA),
      totalMonthlyPayment: formatCurrency(totalMonthlyPayment),
      loanAmount: formatCurrency(loanAmount),
      totalInterest: formatCurrency(totalInterest),
      totalPayments: formatCurrency(totalPayments + (monthlyPropertyTax + monthlyInsurance + monthlyPMI + monthlyHOA) * numberOfPayments),
    };

    setResults(calculatedResults);
    setShowResults(true);

    trackEvent('calculator_used', {
      calculator_type: 'mortgage-calculator',
      home_price: inputs.homePrice,
      down_payment_percent: inputs.downPaymentPercent,
      interest_rate: inputs.interestRate,
      loan_term: inputs.loanTerm,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateMortgage();
  };

  const resultItems = results
    ? [
        {
          label: 'Total Monthly Payment',
          value: results.totalMonthlyPayment,
          description: 'Principal, interest, taxes, insurance, and fees',
          highlight: true,
        },
        {
          label: 'Principal & Interest',
          value: results.monthlyPrincipalInterest,
          description: 'Monthly loan payment',
        },
        {
          label: 'Property Tax',
          value: results.monthlyPropertyTax,
          description: 'Monthly property tax',
        },
        {
          label: 'Home Insurance',
          value: results.monthlyInsurance,
          description: 'Monthly insurance premium',
        },
        ...(inputs.pmi > 0
          ? [
              {
                label: 'PMI',
                value: results.monthlyPMI,
                description: 'Private Mortgage Insurance (down payment < 20%)',
              },
            ]
          : []),
        ...(inputs.hoaFees > 0
          ? [
              {
                label: 'HOA Fees',
                value: results.monthlyHOA,
                description: 'Homeowners Association dues',
              },
            ]
          : []),
        {
          label: 'Loan Amount',
          value: results.loanAmount,
          description: 'Total amount borrowed',
        },
        {
          label: 'Total Interest Paid',
          value: results.totalInterest,
          description: `Over ${inputs.loanTerm} years`,
          highlight: true,
        },
        {
          label: 'Total of All Payments',
          value: results.totalPayments,
          description: 'Principal, interest, and all fees',
        },
      ]
    : [];

  return (
    <CalculatorLayout
      title="Mortgage Calculator"
      description="Calculate your monthly mortgage payment, including principal, interest, taxes, and insurance"
      icon={<Home className="h-8 w-8 text-primary" />}
    >
      {!showResults ? (
        <form onSubmit={handleSubmit} className="space-y-comfortable">
          {/* Home Price */}
          <CalculatorInput
            label="Home Price"
            id="homePrice"
            type="number"
            min="0"
            step="1000"
            value={inputs.homePrice || ''}
            onChange={(e) => handleInputChange('homePrice', e.target.value)}
            prefix="$"
            helpText="Purchase price of the home"
            required
          />

          {/* Down Payment */}
          <div className="space-y-tight">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Down Payment</label>
              <div className="flex items-center gap-tight">
                <button
                  type="button"
                  onClick={() => setUsePercent(true)}
                  className={`px-2 py-1 text-xs rounded ${
                    usePercent
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => setUsePercent(false)}
                  className={`px-2 py-1 text-xs rounded ${
                    !usePercent
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  $
                </button>
              </div>
            </div>
            {usePercent ? (
              <CalculatorInput
                label=""
                id="downPaymentPercent"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={inputs.downPaymentPercent || ''}
                onChange={(e) => handleInputChange('downPaymentPercent', e.target.value)}
                suffix="%"
                helpText={`$${inputs.downPayment.toLocaleString()}`}
                required
              />
            ) : (
              <CalculatorInput
                label=""
                id="downPayment"
                type="number"
                min="0"
                step="1000"
                value={inputs.downPayment || ''}
                onChange={(e) => handleInputChange('downPayment', e.target.value)}
                prefix="$"
                helpText={`${inputs.downPaymentPercent}% of home price`}
                required
              />
            )}
            {inputs.downPaymentPercent < 20 && (
              <p className="text-xs text-warning-dark dark:text-warning-text">
                PMI is typically required for down payments less than 20%
              </p>
            )}
          </div>

          {/* Loan Details */}
          <div className="grid gap-content md:grid-cols-2">
            <CalculatorInput
              label="Interest Rate"
              id="interestRate"
              type="number"
              min="0"
              max="30"
              step="0.125"
              value={inputs.interestRate || ''}
              onChange={(e) => handleInputChange('interestRate', e.target.value)}
              suffix="%"
              helpText="Annual interest rate"
              required
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Loan Term
              </label>
              <select
                value={inputs.loanTerm}
                onChange={(e) => handleInputChange('loanTerm', e.target.value)}
                className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground"
              >
                <option value={30}>30 years</option>
                <option value={20}>20 years</option>
                <option value={15}>15 years</option>
                <option value={10}>10 years</option>
              </select>
            </div>
          </div>

          {/* Additional Costs */}
          <div className="space-y-content border-t border-border pt-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Additional Costs (Optional)
            </h2>

            <div className="grid gap-content md:grid-cols-2">
              <CalculatorInput
                label="Annual Property Tax"
                id="propertyTax"
                type="number"
                min="0"
                step="100"
                value={inputs.propertyTax || ''}
                onChange={(e) => handleInputChange('propertyTax', e.target.value)}
                prefix="$"
                helpText="Yearly property tax"
              />

              <CalculatorInput
                label="Annual Home Insurance"
                id="homeInsurance"
                type="number"
                min="0"
                step="100"
                value={inputs.homeInsurance || ''}
                onChange={(e) => handleInputChange('homeInsurance', e.target.value)}
                prefix="$"
                helpText="Yearly insurance premium"
              />

              <CalculatorInput
                label="Monthly PMI"
                id="pmi"
                type="number"
                min="0"
                step="10"
                value={inputs.pmi || ''}
                onChange={(e) => handleInputChange('pmi', e.target.value)}
                prefix="$"
                helpText="Private mortgage insurance"
              />

              <CalculatorInput
                label="Monthly HOA Fees"
                id="hoaFees"
                type="number"
                min="0"
                step="10"
                value={inputs.hoaFees || ''}
                onChange={(e) => handleInputChange('hoaFees', e.target.value)}
                prefix="$"
                helpText="Homeowners association dues"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-xs hover:bg-primary-hover focus:outline-hidden focus:ring-2 focus:ring-primary"
          >
            Calculate Payment
          </button>
        </form>
      ) : (
        <div>
          <CalculatorResults
            results={resultItems}
            calculatorType="mortgage-calculator"
            inputs={inputs}
          />

          <button
            onClick={() => setShowResults(false)}
            className="mt-content-block w-full rounded-md border border-border bg-card px-6 py-3 text-base font-semibold text-muted-foreground shadow-xs hover:bg-muted dark:border-border dark:bg-muted dark:hover:bg-muted-foreground"
          >
            ← Recalculate
          </button>
        </div>
      )}

      {/* Educational Content */}
      <div className="mt-heading space-y-content border-t pt-8 dark:border-border">
        <h2 className="text-lg font-semibold text-foreground dark:text-primary-foreground">
          Understanding Your Mortgage
        </h2>

        <div className="grid gap-content sm:grid-cols-2">
          <div className="rounded-lg border border-border card-padding-sm dark:border-border">
            <h3 className="mb-subheading font-semibold text-foreground dark:text-primary-foreground">
              Principal vs Interest
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Early payments go mostly toward interest. As you pay down the loan, more goes to principal.
            </p>
          </div>

          <div className="rounded-lg border border-border card-padding-sm dark:border-border">
            <h3 className="mb-subheading font-semibold text-foreground dark:text-primary-foreground">
              20% Down Payment
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Putting 20% down typically eliminates PMI and gets you better interest rates.
            </p>
          </div>

          <div className="rounded-lg border border-border card-padding-sm dark:border-border">
            <h3 className="mb-subheading font-semibold text-foreground dark:text-primary-foreground">
              15 vs 30 Year
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              15-year loans have higher payments but save significantly on total interest paid.
            </p>
          </div>

          <div className="rounded-lg border border-border card-padding-sm dark:border-border">
            <h3 className="mb-subheading font-semibold text-foreground dark:text-primary-foreground">
              Total Cost of Ownership
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Don't forget taxes, insurance, maintenance, and HOA fees in your budget.
            </p>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
