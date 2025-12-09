/**
 * Consolidated Paystub-Related Types
 * Includes form data, validation, storage, and state types
 */

// Paystub US States types (includes abbreviation)
export interface PaystubStateInfo {
  abbreviation: string;
  name: string;
  code: string;
  hasIncomeTax: boolean;
}

// Paystub form validation types
export interface PaystubValidationResult {
  isValid: boolean;
  message?: string;
}

// Re-export from common.ts to maintain backwards compatibility
export type { FormErrors } from './common';

// Paystub core types
export type FilingStatus =
  | "single"
  | "marriedJoint"
  | "marriedSeparate"
  | "headOfHousehold"
  | "qualifyingSurvivingSpouse";

export type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

export const FILING_STATUSES = [
  "single",
  "marriedJoint",
  "marriedSeparate",
  "headOfHousehold",
  "qualifyingSurvivingSpouse",
] as const satisfies FilingStatus[];

export const PAY_FREQUENCIES = ["weekly", "biweekly", "semimonthly", "monthly"] as const satisfies PayFrequency[];

export interface TaxBracket {
  limit: number;
  rate: number;
}

export interface TaxData {
  ssWageBase: number;
  ssRate: number;
  medicareRate: number;
  additionalMedicareRate: number;
  additionalMedicareThreshold: {
    single: number;
    marriedJoint: number;
    marriedSeparate: number;
    headOfHousehold: number;
    qualifyingSurvivingSpouse: number;
  };
  federalBrackets: {
    single: TaxBracket[];
    marriedJoint: TaxBracket[];
    marriedSeparate: TaxBracket[];
    headOfHousehold: TaxBracket[];
    qualifyingSurvivingSpouse: TaxBracket[];
  };
}

export interface PayPeriod {
  period: number;
  payDate: string;
  hours: number;
  grossPay: number;
  federalTax: number;
  socialSecurity: number;
  medicare: number;
  stateTax: number;
  otherDeductions: number;
  netPay: number;
}

export interface PaystubData {
  employeeName: string;
  employeeId: string;
  employerName: string;
  hourlyRate: number;
  hoursPerPeriod: number;
  filingStatus: FilingStatus;
  taxYear: number;
  payPeriods: PayPeriod[];
  totals: {
    hours: number;
    grossPay: number;
    federalTax: number;
    socialSecurity: number;
    medicare: number;
    stateTax: number;
    otherDeductions: number;
    netPay: number;
  };
}
