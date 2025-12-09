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
  savedAt?: number;
}

const EXPIRATION_DAYS = 30;
const EXPIRATION_MS = EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

export function saveFormData(data: PaystubFormData): void {
  // Check if we're in a browser environment to prevent SSR crashes
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const payload: PaystubFormData = {
      ...data,
      savedAt: Date.now(),
    };
    localStorage.setItem(PAYSTUB_STORAGE_KEY, JSON.stringify(payload));
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
    if (!saved) {
      return null;
    }

    const parsed = JSON.parse(saved) as PaystubFormData;
    if (parsed.savedAt && Date.now() - parsed.savedAt > EXPIRATION_MS) {
      localStorage.removeItem(PAYSTUB_STORAGE_KEY);
      return null;
    }

    return parsed;
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
