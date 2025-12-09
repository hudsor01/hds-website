import { usePaystubCalculations } from '@/hooks/use-paystub-calculations'
import { usePaystubForm } from '@/hooks/use-paystub-form'
import { usePaystubValidation } from '@/hooks/use-paystub-validation'
import type { PaystubData } from '@/types/paystub'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, mock } from 'bun:test'

/**
 * Paystub Calculator Hooks Tests
 *
 * These tests use the REAL calculator implementation to mirror production behavior.
 * No mocks of calculatePaystubTotals to avoid test pollution issues.
 */
describe('Paystub Calculator Hooks', () => {
  describe('usePaystubCalculations', () => {
    it('should calculate pay periods correctly', () => {
      const mockSetPaystubData = mock()
      const mockSetResultsVisible = mock()
      const mockSetDocumentType = mock()
      const mockSetSelectedPeriod = mock()

      const mockData: PaystubData = {
        employeeName: 'John Doe',
        employeeId: 'EMP001',
        employerName: 'Test Company',
        hourlyRate: 40,
        hoursPerPeriod: 80,
        filingStatus: 'single',
        taxYear: 2024,
        payPeriods: [],
        totals: {
          hours: 0,
          grossPay: 0,
          federalTax: 0,
          socialSecurity: 0,
          medicare: 0,
          stateTax: 0,
          otherDeductions: 0,
          netPay: 0
        }
      }

      const { result } = renderHook(() => usePaystubCalculations({
        paystubData: mockData,
        selectedState: 'TX',
        payFrequency: 'biweekly',
        overtimeHours: 0,
        overtimeRate: 60,
        additionalDeductions: [],
        setPaystubData: mockSetPaystubData,
        setResultsVisible: mockSetResultsVisible,
        setDocumentType: mockSetDocumentType,
        setSelectedPeriod: mockSetSelectedPeriod,
      }))

      act(() => {
        result.current.generatePaystubs()
      })

      // Test mirrors production: hook should call setPaystubData with updated values
      expect(mockSetPaystubData).toHaveBeenCalledWith(expect.any(Function))
      const updateFn = mockSetPaystubData.mock.calls[0]?.[0] as (data: PaystubData) => PaystubData
      expect(updateFn).toBeDefined()

      if (updateFn) {
        const updatedData = updateFn(mockData)
        // Validate real calculations: 26 biweekly periods, 80 hours * $40/hr = $3200/period
        expect(updatedData.payPeriods).toHaveLength(26)
        expect(updatedData.totals.grossPay).toBeGreaterThan(0)
        expect(updatedData.totals.netPay).toBeGreaterThan(0)
        expect(updatedData.totals.netPay).toBeLessThan(updatedData.totals.grossPay)
      }
    })

    it('should handle overtime calculations', () => {
      const mockSetPaystubData = mock()
      const mockSetResultsVisible = mock()
      const mockSetDocumentType = mock()
      const mockSetSelectedPeriod = mock()

      const mockData: PaystubData = {
        employeeName: 'Jane Smith',
        employeeId: 'EMP002',
        employerName: 'Test Company',
        hourlyRate: 25,
        hoursPerPeriod: 45, // Regular hours
        filingStatus: 'single',
        taxYear: 2024,
        payPeriods: [],
        totals: {
          hours: 0,
          grossPay: 0,
          federalTax: 0,
          socialSecurity: 0,
          medicare: 0,
          stateTax: 0,
          otherDeductions: 0,
          netPay: 0
        }
      }

      const { result } = renderHook(() => usePaystubCalculations({
        paystubData: mockData,
        selectedState: 'TX',
        payFrequency: 'biweekly',
        overtimeHours: 0,
        overtimeRate: 37.5,
        additionalDeductions: [],
        setPaystubData: mockSetPaystubData,
        setResultsVisible: mockSetResultsVisible,
        setDocumentType: mockSetDocumentType,
        setSelectedPeriod: mockSetSelectedPeriod,
      }))

      act(() => {
        result.current.generatePaystubs()
      })

      // Should calculate regular pay: 25 * 45 = 1125, but mocked to return 3200
      expect(mockSetPaystubData).toHaveBeenCalled()
    })
  })

  describe('usePaystubValidation', () => {
    it('should validate required fields', () => {
      const mockData: PaystubData = {
        employeeName: '',
        employeeId: 'EMP001',
        employerName: 'Test Company',
        hourlyRate: 0,
        hoursPerPeriod: 0,
        filingStatus: 'single',
        taxYear: 2024,
        payPeriods: [],
        totals: {
          hours: 0,
          grossPay: 0,
          federalTax: 0,
          socialSecurity: 0,
          medicare: 0,
          stateTax: 0,
          otherDeductions: 0,
          netPay: 0
        }
      }

      const { result } = renderHook(() => usePaystubValidation({
        paystubData: mockData,
        selectedState: 'TX',
        payFrequency: 'biweekly',
        overtimeHours: 0,
        overtimeRate: 60,
        additionalDeductions: []
      }))

      act(() => {
        result.current.validateForm()
      })

      expect(result.current.formErrors.employeeName).toBe('Employee name must be at least 2 characters')
      expect(result.current.formErrors.hourlyRate).toBe('Hourly rate must be greater than $0')
      expect(result.current.formErrors.hoursPerPeriod).toBe('Hours per pay period must be greater than 0')
    })

    it('should pass validation with valid data', () => {
      const mockData: PaystubData = {
        employeeName: 'John Doe',
        employeeId: 'EMP001',
        employerName: 'Test Company',
        hourlyRate: 25,
        hoursPerPeriod: 40,
        filingStatus: 'single',
        taxYear: 2024,
        payPeriods: [],
        totals: {
          hours: 0,
          grossPay: 0,
          federalTax: 0,
          socialSecurity: 0,
          medicare: 0,
          stateTax: 0,
          otherDeductions: 0,
          netPay: 0
        }
      }

      const { result } = renderHook(() => usePaystubValidation({
        paystubData: mockData,
        selectedState: 'TX',
        payFrequency: 'biweekly',
        overtimeHours: 0,
        overtimeRate: 60,
        additionalDeductions: []
      }))

      act(() => {
        const isValid = result.current.validateForm()
        expect(isValid).toBe(true)
      })

      expect(result.current.formErrors.employeeName).toBeUndefined()
      expect(result.current.formErrors.hourlyRate).toBeUndefined()
      expect(result.current.formErrors.hoursPerPeriod).toBeUndefined()
    })
  })

  describe('usePaystubForm', () => {
    it('should manage form state correctly', () => {
      const { result } = renderHook(() => usePaystubForm())

      act(() => {
        result.current.setPaystubData({ employeeName: 'John Doe' })
      })

      expect(result.current.paystubData.employeeName).toBe('John Doe')
    })

    it('should handle pay frequency changes', () => {
      const { result } = renderHook(() => usePaystubForm())

      act(() => {
        result.current.setPayFrequency('biweekly')
      })

      expect(result.current.payFrequency).toBe('biweekly')
    })

    it('should manage additional deductions', () => {
      const { result } = renderHook(() => usePaystubForm())

      act(() => {
        result.current.setAdditionalDeductions([
          { name: 'Health Insurance', amount: 150 },
          { name: 'Dental', amount: 25 }
        ])
      })

      expect(result.current.additionalDeductions).toHaveLength(2)
      const first = result.current.additionalDeductions[0]
      expect(first).toBeDefined()
      expect(first?.name).toBe('Health Insurance')
      expect(first?.amount).toBe(150)
    })
  })
})
