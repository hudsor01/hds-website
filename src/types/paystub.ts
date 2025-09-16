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

export interface FormErrors {
  employeeName?: string;
  hourlyRate?: string;
  hoursPerPeriod?: string;
}

// localStorage types
export interface StoredFormData {
  employeeName: string;
  employeeId: string;
  employerName: string;
  hourlyRate: number;
  hoursPerPeriod: number;
  filingStatus: string;
  taxYear: number;
  state?: string;
}

// Paystub core types
export type FilingStatus =
  | "single"
  | "marriedJoint"
  | "marriedSeparate"
  | "headOfHousehold"
  | "qualifyingSurvivingSpouse";

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
    otherDeductions: number;
    netPay: number;
  };
}
