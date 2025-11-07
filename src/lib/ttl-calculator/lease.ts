import type { LeaseComparisonResults, VehicleInputs } from '../../types/ttl-types'

/**
 * Calculates the remaining loan balance after a certain number of payments
 */
export function calculateRemainingLoanBalance(
  principal: number,
  monthlyInterestRate: number,
  loanTermMonths: number,
  paymentsMade: number
): number {
  // Calculate the monthly payment
  const monthlyPayment = (monthlyInterestRate * principal * Math.pow(1 + monthlyInterestRate, loanTermMonths)) /
    (Math.pow(1 + monthlyInterestRate, loanTermMonths) - 1);

  // Calculate the remaining balance after paymentsMade
  const remainingBalance = principal * Math.pow(1 + monthlyInterestRate, paymentsMade) -
    monthlyPayment * ((Math.pow(1 + monthlyInterestRate, paymentsMade) - 1) / monthlyInterestRate);

  return Math.max(0, remainingBalance);
}

/**
 * Calculates the break-even point between leasing and buying
 */
export function calculateBreakEvenPoint(
  leaseMonthlyPayment: number,
  buyMonthlyPayment: number,
  leaseDownPayment: number,
  buyDownPayment: number
): number {
  // Calculate the difference in monthly payments
  const monthlyDifference = buyMonthlyPayment - leaseMonthlyPayment;

  // If buying is cheaper monthly, there's no break-even point
  if (monthlyDifference <= 0) {
    return 0;
  }

  // Calculate the difference in down payments
  const downPaymentDifference = buyDownPayment - leaseDownPayment;

  // Calculate the break-even point in months
  const breakEvenMonths = downPaymentDifference / monthlyDifference;

  return Math.ceil(breakEvenMonths);
}

/**
 * Provides a recommendation between leasing and buying
 */
export function getLeaseBuyRecommendation(params: {
  leaseMonthlyPayment: number;
  buyMonthlyPayment: number;
  leaseTotalCost: number;
  buyTotalCost: number;
  buyEquityAtEndOfLease: number;
  breakEvenMonth: number;
  input: VehicleInputs;
}): string {
  const {
    leaseMonthlyPayment,
    buyMonthlyPayment,
    leaseTotalCost,
    buyTotalCost,
    buyEquityAtEndOfLease,
    breakEvenMonth,
    input
  } = params;

  // Adjust total cost of buying by considering equity
  const adjustedBuyTotalCost = buyTotalCost - buyEquityAtEndOfLease;

  // If lease term is shorter than break-even point, leasing might be better
  if (breakEvenMonth > (input.leaseTerm || 36)) {
    return `Lease is recommended for your ${input.leaseTerm || 36}-month term. You save $${Math.round(adjustedBuyTotalCost - leaseTotalCost)} over buying.`;
  }

  // If monthly cash flow is the priority
  if (leaseMonthlyPayment < buyMonthlyPayment * 0.8) {
    return `Lease offers significantly lower monthly payments ($${Math.round(leaseMonthlyPayment)} vs $${Math.round(buyMonthlyPayment)}), but buying builds equity.`;
  }

  // If total cost is the priority
  if (adjustedBuyTotalCost < leaseTotalCost) {
    return `Buying is more economical long-term, saving $${Math.round(leaseTotalCost - adjustedBuyTotalCost)} over leasing when considering equity.`;
  }

  // Default recommendation based on ownership preference
  return "Consider your priorities: leasing offers flexibility and lower payments, while buying builds equity and may cost less long-term.";
}

export function calculateLeasePayment(
  vehiclePrice: number,
  downPayment: number,
  leaseTerm: number,
  residualValue: number,
  moneyFactor: number
): number {
  // Lease payment = (Depreciation + Rent Charge) / Term + Fees
  // Depreciation = (Capitalized Cost - Residual Value)
  // Rent Charge = (Capitalized Cost + Residual Value) * Money Factor * Lease Term

  const capitalizedCost = vehiclePrice - downPayment;
  const depreciation = capitalizedCost - residualValue;
  const rentCharge = (capitalizedCost + residualValue) * moneyFactor * leaseTerm;

  return (depreciation + rentCharge) / leaseTerm;
}

export function calculateLeaseComparison(input: VehicleInputs): LeaseComparisonResults {
  if (!input.leaseMode) {
    // If not in lease mode, return a comparison based on lease options
    const estimatedResidual = input.purchasePrice * 0.55; // 55% residual for 36 months
    const estimatedMoneyFactor = input.interestRate / 2400; // Convert APR to money factor

    const leaseMonthlyPayment = calculateLeasePayment(
      input.purchasePrice,
      input.leaseDownPayment || 0,
      input.leaseTerm || 36,
      estimatedResidual,
      estimatedMoneyFactor
    );

    const leaseTotalCost = leaseMonthlyPayment * (input.leaseTerm || 36) + (input.leaseDownPayment || 0);

    // Calculate buy payment (what's already calculated in main payment function)
    const buyMonthlyPayment = input.paymentFrequency === 'monthly'
      ? (input.interestRate / 1200) * input.purchasePrice * Math.pow(1 + (input.interestRate / 1200), input.loanTermMonths) /
        (Math.pow(1 + (input.interestRate / 1200), input.loanTermMonths) - 1)
      : ((input.interestRate / 2400) * input.purchasePrice * Math.pow(1 + (input.interestRate / 2400), input.loanTermMonths * 2) /
        (Math.pow(1 + (input.interestRate / 2400), input.loanTermMonths * 2) - 1)) / 2;

    const buyTotalCost = buyMonthlyPayment * input.loanTermMonths + input.downPayment;

    // Calculate equity at end of lease (difference between vehicle value and loan balance)
    const vehicleValueAtLeaseEnd = estimatedResidual;
    const remainingLoanBalance = calculateRemainingLoanBalance(
      input.purchasePrice - input.downPayment,
      input.interestRate / 120,
      input.loanTermMonths,
      input.leaseTerm || 36
    );

    const buyEquityAtEndOfLease = vehicleValueAtLeaseEnd - remainingLoanBalance;

    // Calculate break-even point
    const breakEvenMonth = calculateBreakEvenPoint(
      leaseMonthlyPayment,
      buyMonthlyPayment,
      input.leaseDownPayment || 0,
      input.downPayment
    );

    const recommendation = getLeaseBuyRecommendation({
      leaseMonthlyPayment,
      buyMonthlyPayment,
      leaseTotalCost,
      buyTotalCost,
      buyEquityAtEndOfLease,
      breakEvenMonth,
      input
    });

    return {
      monthlyLeasePayment: leaseMonthlyPayment,
      totalLeaseCost: leaseTotalCost,
      purchaseOption: input.residualValue || 0,
      leaseVsBuy: recommendation
    };
  } else {
    // If already in lease mode, calculate actual lease terms
    const leaseMonthlyPayment = calculateLeasePayment(
      input.purchasePrice,
      input.leaseDownPayment || 0,
      input.leaseTerm || 36,
      input.residualValue || 0,
      input.moneyFactor || 0
    );

    const leaseTotalCost = leaseMonthlyPayment * (input.leaseTerm || 36) + (input.leaseDownPayment || 0);

    // Calculate buy option for comparison
    const buyMonthlyPayment = input.paymentFrequency === 'monthly'
      ? (input.interestRate / 1200) * input.purchasePrice * Math.pow(1 + (input.interestRate / 1200), input.loanTermMonths) /
        (Math.pow(1 + (input.interestRate / 1200), input.loanTermMonths) - 1)
      : ((input.interestRate / 2400) * input.purchasePrice * Math.pow(1 + (input.interestRate / 2400), input.loanTermMonths * 2) /
        (Math.pow(1 + (input.interestRate / 2400), input.loanTermMonths * 2) - 1)) / 2;

    const buyTotalCost = buyMonthlyPayment * input.loanTermMonths + input.downPayment;

    const vehicleValueAtLeaseEnd = input.residualValue;
    const remainingLoanBalance = calculateRemainingLoanBalance(
      input.purchasePrice - (input.downPayment || 0),
      (input.interestRate || 6.5) / 1200,
      input.loanTermMonths || 60,
      input.leaseTerm || 36
    );

    const buyEquityAtEndOfLease = vehicleValueAtLeaseEnd - remainingLoanBalance;

    const breakEvenMonth = calculateBreakEvenPoint(
      leaseMonthlyPayment,
      buyMonthlyPayment,
      input.leaseDownPayment || 0,
      input.downPayment
    );

    const recommendation = getLeaseBuyRecommendation({
      leaseMonthlyPayment,
      buyMonthlyPayment,
      leaseTotalCost,
      buyTotalCost,
      buyEquityAtEndOfLease,
      breakEvenMonth,
      input
    });

    return {
      monthlyLeasePayment: leaseMonthlyPayment,
      totalLeaseCost: leaseTotalCost,
      purchaseOption: input.residualValue || 0,
      leaseVsBuy: recommendation
    };
  }
}
