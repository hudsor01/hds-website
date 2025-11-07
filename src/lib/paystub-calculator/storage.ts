const PAYSTUB_STORAGE_KEY = 'paystub-calculator-form-data';

interface PaystubFormData {
  employeeName: string;
  employeeId: string;
  employerName: string;
  hourlyRate: number;
  hoursPerPeriod: number;
  filingStatus: string;
  taxYear: number;
  state?: string;
}

export function saveFormData(data: PaystubFormData): void {
  try {
    localStorage.setItem(PAYSTUB_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Error saving paystub form data:', error);
  }
}

export function loadFormData(): PaystubFormData | null {
  try {
    const saved = localStorage.getItem(PAYSTUB_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Error loading paystub form data:', error);
    return null;
  }
}

export function clearFormData(): void {
  try {
    localStorage.removeItem(PAYSTUB_STORAGE_KEY);
  } catch (error) {
    console.warn('Error clearing paystub form data:', error);
  }
}