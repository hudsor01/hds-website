import { z } from 'zod'

export const vehicleInputSchema = z.object({
  purchasePrice: z.number().positive('Purchase price must be positive'),
  tradeInValue: z.number().nonnegative('Trade-in value cannot be negative'),
  vehicleWeight: z.number().positive('Vehicle weight must be positive'),
  isElectric: z.boolean(),
  isNewVehicle: z.boolean(),
  county: z.string().min(1, 'County is required'),
  loanTermMonths: z.number().min(12).max(84).int(),
  interestRate: z.number().min(0).max(100).step(0.01, 'Interest rate must be between 0-10%'),
  downPayment: z.number().nonnegative('Down payment cannot be negative'),
  paymentFrequency: z.enum(['monthly', 'biweekly', 'weekly']),
  zipCode: z.string().regex(/^\d{5}$/, 'Invalid ZIP code'),
  loanStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  leaseMileage: z.number().min(0),
  leaseBuyout: z.number().min(0),
  residualValue: z.number().min(0),
  moneyFactor: z.number().min(0),
  creditScore: z.number().min(300).max(850).optional(),
  rebateAmount: z.number().min(0).optional(),
  insuranceMonthly: z.number().min(0).optional(),
  maintenanceCostPerYear: z.number().min(0).optional(),
  mpg: z.number().positive().optional(),
  milesPerYear: z.number().min(0).optional(),
  gasPrice: z.number().min(0).optional(),
  electricityRate: z.number().min(0).optional(),
  leaseMode: z.boolean().optional(),
  leaseTerm: z.number().min(12).max(60).optional(),
  leaseDownPayment: z.number().min(0).optional(),
});

export type VehicleInput = z.infer<typeof vehicleInputSchema>;

// Export other types that might be needed
export type { CalculationResults, LeaseComparisonResults, PaymentResults, SavedCalculation, TCOResults, TTLResults } from '../../types/ttl-types'
