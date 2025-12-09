import type { PayPeriod, PaystubData, TaxData } from "@/types/paystub";
import { calculateStateTax } from "./state-tax-calculations";
import { calculateFederalTax, calculateMedicare, calculateSocialSecurity } from "./tax-calculations";
import { validatePaystubInputs } from "./validation";

export interface PaystubCalculationParams {
  hourlyRate: number;
 hoursPerPeriod: number;
  filingStatus: keyof TaxData['federalBrackets'];
  taxYear: number;
  state: string;
  payFrequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
  overtimeHours?: number;
  overtimeRate?: number;
  additionalDeductions?: Array<{ name: string; amount: number }>;
}

export interface PaystubCalculationResult {
  payPeriods: PayPeriod[];
  totals: PaystubData['totals'];
}

export const calculatePaystubTotals = (params: PaystubCalculationParams): PaystubCalculationResult => {
  const {
    hourlyRate,
    hoursPerPeriod,
    filingStatus,
    taxYear,
    state,
    payFrequency,
    overtimeHours = 0,
    overtimeRate = hourlyRate * 1.5,
    additionalDeductions = []
  } = params;

  const validation = validatePaystubInputs(params);
  if (!validation.isValid) {
    const message = `Invalid paystub inputs: ${Object.values(validation.errors).join(", ")}`;
    throw new Error(message);
  }

  // Calculate number of pay periods based on frequency
  const payPeriodsCount = ({
    weekly: 52,
    biweekly: 26,
    semimonthly: 24,
    monthly: 12
  } as const)[payFrequency] ?? 26;

  // Generate pay dates
  const generatePayDates = (frequency: typeof payFrequency) => {
    const dates: Date[] = [];
    const year = taxYear;

    switch (frequency) {
      case 'weekly':
        // Start from January 1st and generate weekly pay dates
        const currentDate = new Date(year, 0, 1); // Jan 1
        // Find the first Monday of the year
        while (currentDate.getDay() !== 1) { // 1 = Monday
          currentDate.setDate(currentDate.getDate() + 1);
        }
        for (let i = 0; i < 52; i++) {
          dates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 7);
        }
        break;
      case 'biweekly':
        // Start from January 1st and generate bi-weekly pay dates
        const biweeklyDate = new Date(year, 0, 1);
        // Find the first payday (every other Monday)
        while (biweeklyDate.getDay() !== 1) { // 1 = Monday
          biweeklyDate.setDate(biweeklyDate.getDate() + 1);
        }
        for (let i = 0; i < 26; i++) {
          dates.push(new Date(biweeklyDate));
          biweeklyDate.setDate(biweeklyDate.getDate() + 14);
        }
        break;
      case 'semimonthly':
        for (let month = 0; month < 12; month++) {
          // 15th of each month
          dates.push(new Date(year, month, 15));
          // Last day of each month (account for different month lengths)
          const lastDay = new Date(year, month + 1, 0).getDate();
          dates.push(new Date(year, month, lastDay));
        }
        break;
      case 'monthly':
        for (let month = 0; month < 12; month++) {
          // Typically on the last business day of the month
          const lastDay = new Date(year, month + 1, 0); // Last day of the month
          // Adjust to Friday if the last day falls on a weekend
          const adjustedDate = new Date(lastDay);
          if (adjustedDate.getDay() === 0) { // Sunday
            adjustedDate.setDate(adjustedDate.getDate() - 2); // Previous Friday
          } else if (adjustedDate.getDay() === 6) { // Saturday
            adjustedDate.setDate(adjustedDate.getDate() - 1); // Previous Friday
          }
          dates.push(adjustedDate);
        }
        break;
    }
    return dates;
  };

  const payDates = generatePayDates(payFrequency).slice(0, payPeriodsCount);
  const payPeriods: PayPeriod[] = [];
  let ytdGross = 0;

  const totals = {
    hours: 0,
    grossPay: 0,
    federalTax: 0,
    socialSecurity: 0,
    medicare: 0,
    stateTax: 0,
    otherDeductions: 0,
    netPay: 0
  };

  for (let i = 0; i < payPeriodsCount; i++) {
    // Calculate gross pay including overtime
    const regularPay = hourlyRate * hoursPerPeriod;
    const overtimePay = overtimeHours * overtimeRate;
    const currentGrossPay = regularPay + overtimePay;

    // Calculate taxes
    const federalTax = calculateFederalTax(currentGrossPay, filingStatus, ytdGross, taxYear);
    const socialSecurity = calculateSocialSecurity(currentGrossPay, ytdGross, taxYear);
    const medicare = calculateMedicare(currentGrossPay, ytdGross, filingStatus, taxYear);
    const stateTax = calculateStateTax(currentGrossPay, ytdGross, state, filingStatus, taxYear);

    // Calculate other deductions
    const otherDeductions = additionalDeductions.reduce((sum, deduction) => sum + deduction.amount, 0);

    // Calculate net pay
    const totalDeductions = federalTax + socialSecurity + medicare + stateTax + otherDeductions;
    const netPay = currentGrossPay - totalDeductions;

    const payPeriod: PayPeriod = {
      period: i + 1,
      payDate: payDates[i]?.toISOString() || new Date().toISOString(),
      hours: hoursPerPeriod + overtimeHours,
      grossPay: currentGrossPay,
      federalTax,
      socialSecurity,
      medicare,
      stateTax,
      otherDeductions,
      netPay
    };

    payPeriods.push(payPeriod);

    // Update YTD totals
    ytdGross += currentGrossPay;

    totals.hours += hoursPerPeriod + overtimeHours;
    totals.grossPay += currentGrossPay;
    totals.federalTax += federalTax;
    totals.socialSecurity += socialSecurity;
    totals.medicare += medicare;
    totals.stateTax += stateTax;
    totals.otherDeductions += otherDeductions;
    totals.netPay += netPay;
  }

  return { payPeriods, totals };
};
