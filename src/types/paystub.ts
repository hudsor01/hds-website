// Paystub-related types and interfaces

export type FilingStatus = 'single' | 'marriedJoint' | 'marriedSeparate' | 'headOfHousehold' | 'qualifyingSurvivingSpouse'

export interface TaxBracket {
  limit: number
  rate: number
}

export interface TaxData {
  ssWageBase: number
  ssRate: number
  medicareRate: number
  additionalMedicareRate: number
  additionalMedicareThreshold: {
    single: number
    marriedJoint: number
    marriedSeparate: number
    headOfHousehold: number
    qualifyingSurvivingSpouse: number
  }
  federalBrackets: {
    single: TaxBracket[]
    marriedJoint: TaxBracket[]
    marriedSeparate: TaxBracket[]
    headOfHousehold: TaxBracket[]
    qualifyingSurvivingSpouse: TaxBracket[]
  }
}

export interface PayPeriod {
  period: number
  payDate: string
  hours: number
  grossPay: number
  federalTax: number
  socialSecurity: number
  medicare: number
  otherDeductions: number
  netPay: number
}

export interface PaystubData {
  employeeName: string
  employeeId: string
  employerName: string
  hourlyRate: number
  hoursPerPeriod: number
  filingStatus: FilingStatus
  taxYear: number
  payPeriods: PayPeriod[]
  totals: {
    hours: number
    grossPay: number
    federalTax: number
    socialSecurity: number
    medicare: number
    otherDeductions: number
    netPay: number
  }
}