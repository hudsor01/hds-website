import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format a date string
 * @param date - The date to format
 * @param options - Date formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
): string {
  return new Date(date).toLocaleDateString('en-US', options)
}

/**
 * Format a date string with long month names
 * @param date - The date to format
 * @returns Formatted date string with long month names
 */
export function formatDateLong(date: string): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
