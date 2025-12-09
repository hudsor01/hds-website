import type { PaystubCalculationParams } from './calculate-paystub-totals';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validatePaystubInputs = (params: PaystubCalculationParams): ValidationResult => {
  const errors: Record<string, string> = {};

  // Validate hourly rate
  if (params.hourlyRate <= 0) {
    errors.hourlyRate = 'Hourly rate must be greater than $0';
  } else if (params.hourlyRate > 1000) {
    errors.hourlyRate = 'Hourly rate seems unusually high (over $1,000)';
  }

  // Validate hours per period
  if (params.hoursPerPeriod <= 0) {
    errors.hoursPerPeriod = 'Hours per pay period must be greater than 0';
  } else if (params.hoursPerPeriod > 168) { // More than a week of hours
    errors.hoursPerPeriod = 'Hours per period seems unusually high (over 168 hours)';
  }

  // Validate overtime hours
  if (params.overtimeHours !== undefined && params.overtimeHours < 0) {
    errors.overtimeHours = 'Overtime hours cannot be negative';
  } else if (params.overtimeHours !== undefined && params.overtimeHours > 80) {
    errors.overtimeHours = 'Overtime hours seems unusually high (over 80 hours)';
  }

  // Validate overtime rate
  if (params.overtimeRate !== undefined && params.overtimeRate < params.hourlyRate) {
    errors.overtimeRate = 'Overtime rate should be higher than regular hourly rate';
  }

  // Validate tax year
  const currentYear = new Date().getFullYear();
  if (params.taxYear < 2020 || params.taxYear > currentYear + 5) {
    errors.taxYear = `Tax year must be between 2020 and ${currentYear + 5}`;
  }

  // Validate pay frequency
  const validFrequencies: Array<PaystubCalculationParams['payFrequency']> = ['weekly', 'biweekly', 'semimonthly', 'monthly'];
  if (!validFrequencies.includes(params.payFrequency)) {
    errors.payFrequency = 'Invalid pay frequency';
  }

  // Validate filing status
  const validFilingStatuses: Array<PaystubCalculationParams['filingStatus']> = [
    'single', 'marriedJoint', 'marriedSeparate', 'headOfHousehold', 'qualifyingSurvivingSpouse'
  ];
  if (!validFilingStatuses.includes(params.filingStatus)) {
    errors.filingStatus = 'Invalid filing status';
  }

  // Validate state (basic validation - could be expanded)
  if (params.state && params.state.length !== 2) {
    errors.state = 'State must be a 2-letter abbreviation';
  }

  // Validate additional deductions
  if (params.additionalDeductions) {
    params.additionalDeductions.forEach((deduction, index) => {
      if (deduction.amount < 0) {
        errors[`deduction_${index}_amount`] = `Deduction ${index + 1} amount cannot be negative`;
      }
      if (!deduction.name) {
        errors[`deduction_${index}_name`] = `Deduction ${index + 1} name is required`;
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateEmployeeInputs = (employeeData: {
  employeeName?: string;
  hourlyRate?: number;
  hoursPerPeriod?: number;
}) => {
  const errors: Record<string, string> = {};

  if (!employeeData.employeeName || employeeData.employeeName.trim().length < 2) {
    errors.employeeName = 'Employee name must be at least 2 characters';
  } else if (employeeData.employeeName.length > 100) {
    errors.employeeName = 'Employee name must be less than 100 characters';
  }

  if (employeeData.hourlyRate !== undefined && employeeData.hourlyRate <= 0) {
    errors.hourlyRate = 'Hourly rate must be greater than $0';
  }

  if (employeeData.hoursPerPeriod !== undefined && employeeData.hoursPerPeriod <= 0) {
    errors.hoursPerPeriod = 'Hours per pay period must be greater than 0';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validatePayPeriodInputs = (grossPay: number, filingStatus: string, state: string) => {
  const errors: Record<string, string> = {};

  // Validate gross pay is reasonable
  if (grossPay <= 0) {
    errors.grossPay = 'Gross pay must be greater than $0';
  } else if (grossPay > 100000) { // $100,000 per pay period is extremely high
    errors.grossPay = 'Gross pay seems unusually high for a single pay period';
  }

  // Validate filing status
  const validFilingStatuses = ['single', 'marriedJoint', 'marriedSeparate', 'headOfHousehold', 'qualifyingSurvivingSpouse'];
  if (!validFilingStatuses.includes(filingStatus)) {
    errors.filingStatus = 'Invalid filing status';
  }

  // Validate state format
  if (state && state.length !== 2) {
    errors.state = 'State must be a 2-letter abbreviation';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
