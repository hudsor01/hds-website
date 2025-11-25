// Define the main calculation result types
export interface TTLResults {
  salesTax: number;
  titleFee: number;
  registrationFees: number;
  processingFees: number;
  evFee: number;
  emissions: number;
  totalTTL: number;
}

export interface PaymentResults {
  loanAmount: number;
  monthlyPayment: number;
  biweeklyPayment: number;
  totalInterest: number;
  totalFinanced: number;
}

export interface TCOResults {
  totalCostOfOwnership: number;
  annualCost: number;
  maintenanceCost: number;
  fuelCost: number;
}

export interface LeaseComparisonResults {
  monthlyLeasePayment: number;
  totalLeaseCost: number;
  purchaseOption: number;
  leaseVsBuy: string;
}

export interface SavedCalculation {
  id: string;
  name: string;
  timestamp: number;
  inputs: VehicleInputs;
  results: CalculationResults;
}

export interface CalculationResults {
  ttlResults?: TTLResults;
  paymentResults?: PaymentResults;
  tcoResults?: TCOResults;
  leaseComparisonResults?: LeaseComparisonResults;
}

// Define the main input type for vehicle calculations
export interface VehicleInputs {
  purchasePrice: number;
  tradeInValue: number;
  vehicleWeight: number;
  isElectric: boolean;
  isNewVehicle: boolean;
  county: string;
  loanTermMonths: number;
  interestRate: number;
  downPayment: number;
  paymentFrequency: 'monthly' | 'biweekly' | 'weekly';
  zipCode: string;
  loanStartDate: string;
  leaseMileage: number;
  leaseBuyout: number;
  residualValue: number;
  moneyFactor: number;
  creditScore?: number;
  rebateAmount?: number;
  insuranceMonthly?: number;
  maintenanceCostPerYear?: number;
  mpg?: number;
  milesPerYear?: number;
  gasPrice?: number;
  electricityRate?: number;
  leaseMode?: boolean;
  leaseTerm?: number;
  leaseDownPayment?: number;
}

// Define credit score to interest rate mapping
export interface CreditScoreRate {
  min: number;
  max: number;
  typicalRate: number;
  label: string;
}

// Define the schema for the calculator context
export interface CalculatorContextType {
  inputs: VehicleInputs;
  results: CalculationResults;
  updateInput: (field: keyof VehicleInputs, value: unknown) => void;
  calculate: () => void;
  savedCalculations: Array<{
    id: string;
    name: string;
    timestamp: number;
    inputs: VehicleInputs;
    results: CalculationResults;
  }>;
  loadSavedCalculation: (id: string) => void;
  deleteSavedCalculation: (id: string) => void;
  clearAllSaved: () => void;
}

export interface UseCalculationsReturn {
  inputs: VehicleInputs;
  results: CalculationResults;
  updateInput: (field: keyof VehicleInputs, value: unknown) => void;
  calculate: () => void;
}
