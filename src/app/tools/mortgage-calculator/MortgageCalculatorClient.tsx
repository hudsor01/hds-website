/**
 * Mortgage Calculator Client Component
 * Contains the interactive mortgage calculation form with URL state management
 */

'use client';

import { useState } from 'react';
import { useQueryState, parseAsFloat, parseAsInteger } from 'nuqs';
import { CalculatorInput } from '@/components/calculators/CalculatorInput';
import { CalculatorResults } from '@/components/calculators/CalculatorResults';
import { trackEvent } from '@/lib/analytics';
import { formatCurrency } from '@/lib/utils';

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

export function MortgageCalculatorClient() {
  const [homePrice, setHomePrice] = useQueryState('price', parseAsFloat.withDefault(350000));
  const [downPayment, setDownPayment] = useQueryState('dp', parseAsFloat.withDefault(70000));
  const [downPaymentPercent, setDownPaymentPercent] = useQueryState('dpp', parseAsFloat.withDefault(20));
  const [interestRate, setInterestRate] = useQueryState('rate', parseAsFloat.withDefault(6.5));
  const [loanTerm, setLoanTerm] = useQueryState('term', parseAsInteger.withDefault(30));
  const [propertyTax, setPropertyTax] = useQueryState('tax', parseAsFloat.withDefault(3500));
  const [homeInsurance, setHomeInsurance] = useQueryState('ins', parseAsFloat.withDefault(1200));
  const [pmi, setPmi] = useQueryState('pmi', parseAsFloat.withDefault(0));
  const [hoaFees, setHoaFees] = useQueryState('hoa', parseAsFloat.withDefault(0));

  const [results, setResults] = useState<MortgageResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [usePercent, setUsePercent] = useState(true);

  const inputs: MortgageInputs = {
    homePrice,
    downPayment,
    downPaymentPercent,
    interestRate,
    loanTerm,
    propertyTax,
    homeInsurance,
    pmi,
    hoaFees
  };

  const handleInputChange = (field: keyof MortgageInputs, value: string) => {
    const numValue = parseFloat(value) || 0;

    if (field === 'downPaymentPercent') {
      const dpValue = (homePrice * numValue) / 100;
      setDownPaymentPercent(numValue);
      setDownPayment(Math.round(dpValue));
      // Auto-add PMI if down payment < 20%
      if (numValue < 20) {
        setPmi(100);
      } else if (downPaymentPercent >= 20) {
        setPmi(0);
      }
    } else if (field === 'downPayment') {
      const percent = (numValue / homePrice) * 100;
      setDownPayment(numValue);
      setDownPaymentPercent(Math.round(percent * 10) / 10);
      // Auto-add PMI if percent < 20%
      if (percent < 20) {
        setPmi(100);
      } else if (percent >= 20) {
        setPmi(0);
      }
    } else if (field === 'homePrice') {
      const newDownPayment = usePercent
        ? (numValue * downPaymentPercent) / 100
        : downPayment;
      const newPercent = usePercent
        ? downPaymentPercent
        : (downPayment / numValue) * 100;
      setHomePrice(numValue);
      setDownPayment(Math.round(newDownPayment));
      setDownPaymentPercent(Math.round(newPercent * 10) / 10);
    } else {
      switch (field) {
        case 'interestRate':
          setInterestRate(numValue);
          break;
        case 'loanTerm':
          setLoanTerm(numValue);
          break;
        case 'propertyTax':
          setPropertyTax(numValue);
          break;
        case 'homeInsurance':
          setHomeInsurance(numValue);
          break;
        case 'pmi':
          setPmi(numValue);
          break;
        case 'hoaFees':
          setHoaFees(numValue);
          break;
        default:
          break;
      }
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
    <>
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
                      ? 'bg-primary text-foreground'
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
                      ? 'bg-primary text-foreground'
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
                helpText={formatCurrency(inputs.downPayment)}
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
              <label htmlFor="loanTerm" className="block text-sm font-medium text-foreground mb-1">
                Loan Term
              </label>
              <select
                id="loanTerm"
                name="loanTerm"
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
            className="w-full rounded-md bg-primary px-6 py-3 text-base font-semibold text-foreground shadow-xs hover:bg-primary-hover focus:outline-hidden focus:ring-2 focus:ring-primary"
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
            onClick={() => {
              setShowResults(false);
              setHomePrice(350000);
              setDownPayment(70000);
              setDownPaymentPercent(20);
              setInterestRate(6.5);
              setLoanTerm(30);
              setPropertyTax(3500);
              setHomeInsurance(1200);
              setPmi(0);
              setHoaFees(0);
            }}
            className="mt-content-block w-full rounded-md border border-border bg-card px-6 py-3 text-base font-semibold text-muted-foreground shadow-xs hover:bg-muted dark:border-border dark:bg-muted dark:hover:bg-muted-foreground"
          >
            Recalculate
          </button>
        </div>
      )}
    </>
  );
}
