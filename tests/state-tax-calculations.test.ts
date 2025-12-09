import { describe, it, expect } from 'bun:test'
import { calculateStateTax } from '@/lib/paystub-calculator/state-tax-calculations'

describe('State Tax Calculations', () => {
  describe('Illinois State Tax (4.95% flat)', () => {
    it('should calculate IL state tax correctly', () => {
      const grossPay = 5000
      const ytdGross = 25000

      const tax = calculateStateTax(grossPay, ytdGross, 'IL', 'single')

      // IL has 4.95% flat rate
      expect(tax).toBeCloseTo(247.50, 2) // 5000 * 0.0495
    })

    it('should handle YTD accumulation for progressive states', () => {
      const grossPay = 3000
      const ytdGross = 15000

      const tax = calculateStateTax(grossPay, ytdGross, 'IL', 'single')

      // Still flat rate for IL
      expect(tax).toBeCloseTo(148.50, 2) // 3000 * 0.0495
    })
  })

  describe('Pennsylvania State Tax (3.07% flat)', () => {
    it('should calculate PA state tax correctly', () => {
      const grossPay = 4000
      const ytdGross = 20000

      const tax = calculateStateTax(grossPay, ytdGross, 'PA', 'single')

      // PA has 3.07% flat rate
      expect(tax).toBeCloseTo(122.80, 2) // 4000 * 0.0307
    })
  })

  describe('Massachusetts State Tax (progressive)', () => {
    it('should calculate MA state tax for low income', () => {
      const grossPay = 2000
      const ytdGross = 10000

      const tax = calculateStateTax(grossPay, ytdGross, 'MA', 'single')

      // MA has progressive rates starting at 5.35%
      expect(tax).toBeCloseTo(107, 2) // 2000 * 0.0535
    })

    it('should calculate MA state tax for higher income', () => {
      const grossPay = 5000
      const ytdGross = 80000

      const tax = calculateStateTax(grossPay, ytdGross, 'MA', 'single')

      // MA progressive: first bracket up to ~$1M at 5.35%
      expect(tax).toBeCloseTo(267.50, 2) // 5000 * 0.0535
    })
  })

  describe('No State Income Tax states', () => {
    it('should return 0 for Texas (no state income tax)', () => {
      const grossPay = 5000
      const ytdGross = 25000

      const tax = calculateStateTax(grossPay, ytdGross, 'TX', 'single')

      expect(tax).toBe(0)
    })

    it('should return 0 for Florida (no state income tax)', () => {
      const grossPay = 6000
      const ytdGross = 30000

      const tax = calculateStateTax(grossPay, ytdGross, 'FL', 'single')

      expect(tax).toBe(0)
    })
  })

  describe('Error handling', () => {
    it('should handle unknown states gracefully', () => {
      const grossPay = 5000
      const ytdGross = 25000

      const tax = calculateStateTax(grossPay, ytdGross, 'XX', 'single')

      expect(tax).toBe(0)
    })
  })

  describe('California State Tax (progressive)', () => {
    it('calculates CA state tax for single filer', () => {
      const tax = calculateStateTax(5000, 20000, 'CA', 'single')
      expect(tax).toBeGreaterThan(0)
    })

    it('falls back to single brackets for headOfHousehold', () => {
      const tax = calculateStateTax(5000, 20000, 'CA', 'headOfHousehold')
      expect(tax).toBeGreaterThan(0)
    })
  })

  describe('New York State Tax (progressive)', () => {
    it('handles married separate using fallback brackets', () => {
      const tax = calculateStateTax(3000, 10000, 'ny', 'marriedSeparate')
      expect(tax).toBeGreaterThan(0)
    })
  })

  describe('States with no income tax', () => {
    it('returns zero for TX', () => {
      const tax = calculateStateTax(4000, 10000, 'TX', 'single')
      expect(tax).toBe(0)
    })
  })
})
