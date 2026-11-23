/**
 * Common types shared across multiple modules
 */

// Form validation error types for paystub
export interface FormErrors {
	employeeName?: string
	hourlyRate?: string
	hoursPerPeriod?: string
	taxYear?: string
	dependentsCredit?: string
	otherIncome?: string
	deductions?: string
	extraWithholding?: string
	retirementPerPeriod?: string
	healthPerPeriod?: string
	stateAllowances?: string
	stateAdditionalAllowances?: string
}
