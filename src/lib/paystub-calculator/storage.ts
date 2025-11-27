import { logger } from '@/lib/logger';

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
  // Check if we're in a browser environment to prevent SSR crashes
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(PAYSTUB_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    logger.error('Error saving paystub form data:', error as Error);
  }
}

export function loadFormData(): PaystubFormData | null {
  // Check if we're in a browser environment to prevent SSR crashes
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const saved = localStorage.getItem(PAYSTUB_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    logger.error('Error loading paystub form data:', error as Error);
    return null;
  }
}

export function clearFormData(): void {
  // Check if we're in a browser environment to prevent SSR crashes
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(PAYSTUB_STORAGE_KEY);
  } catch (error) {
    logger.error('Error clearing paystub form data:', error as Error);
  }
}