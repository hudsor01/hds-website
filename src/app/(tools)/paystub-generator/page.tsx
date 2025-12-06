'use client'

import { AnnualWageSummary } from '@/components/AnnualWageSummary'
import { PayStub } from '@/components/paystub/PayStub'
import { logger } from '@/lib/logger'
import { getCurrentTaxData } from '@/lib/paystub-calculator/paystub-utils'
import { getIncomeTaxStates, getNoIncomeTaxStates } from '@/lib/paystub-calculator/states-utils'
import { clearFormData, loadFormData, saveFormData } from '@/lib/paystub-calculator/storage'
import { calculateFederalTax, calculateMedicare, calculateSocialSecurity } from '@/lib/paystub-calculator/tax-calculations'
import { paystubFormSchema } from '@/lib/schemas'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { FormErrors } from '@/types/common'
import type { FilingStatus, PayPeriod, PaystubData, TaxData } from '@/types/paystub'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function Home() {
  const [paystubData, setPaystubData] = useState<PaystubData>({
    employeeName: '',
    employeeId: '',
    employerName: '',
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
      otherDeductions: 0,
      netPay: 0
    }
  })

  const [selectedState, setSelectedState] = useState<string>('')
  const [resultsVisible, setResultsVisible] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1)
  const [documentType, setDocumentType] = useState<'form' | 'paystub' | 'annual'>('form')
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isGenerating, setIsGenerating] = useState(false)

  // Load saved form data on mount
  useEffect(() => {
    const savedData = loadFormData()
    if (savedData) {
      setPaystubData(prev => ({
        ...prev,
        employeeName: savedData.employeeName,
        employeeId: savedData.employeeId,
        employerName: savedData.employerName,
        hourlyRate: savedData.hourlyRate,
        hoursPerPeriod: savedData.hoursPerPeriod,
        filingStatus: savedData.filingStatus as FilingStatus,
        taxYear: savedData.taxYear
      }))
      if (savedData.state) {
        setSelectedState(savedData.state)
      }
      toast.success('Form data restored from previous session')
    }
  }, [])

  // Auto-save form data
  const saveCurrentFormData = useCallback(() => {
    const dataToSave = {
      employeeName: paystubData.employeeName,
      employeeId: paystubData.employeeId,
      employerName: paystubData.employerName,
      hourlyRate: paystubData.hourlyRate,
      hoursPerPeriod: paystubData.hoursPerPeriod,
      filingStatus: paystubData.filingStatus,
      taxYear: paystubData.taxYear,
      state: selectedState
    }
    saveFormData(dataToSave)
  }, [paystubData, selectedState])

  // Save form data whenever it changes
  useEffect(() => {
    if (paystubData.employeeName || paystubData.hourlyRate || paystubData.hoursPerPeriod) {
      saveCurrentFormData()
    }
  }, [paystubData.employeeName, paystubData.hourlyRate, paystubData.hoursPerPeriod, paystubData.employeeId, paystubData.employerName, paystubData.filingStatus, paystubData.taxYear, selectedState, saveCurrentFormData])

  // Clear form function
  const handleClearForm = () => {
    setPaystubData({
      employeeName: '',
      employeeId: '',
      employerName: '',
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
        otherDeductions: 0,
        netPay: 0
      }
    })
    setSelectedState('')
    setResultsVisible(false)
    setFormErrors({})
    setDocumentType('form')
    clearFormData()
    toast.success('Form cleared successfully')

    // Focus first input
    setTimeout(() => {
      const firstInput = document.querySelector('input[type="text"]') as HTMLInputElement
      if (firstInput) {firstInput.focus()}
    }, 100)
  }

  const generatePaystubs = () => {
    // Start performance tracking
    logger.time('paystub-generation')

    // Track user interaction
    logger.info('Paystub generation process started', {
      component: 'PaystubGeneratorPage',
      userFlow: 'paystub_tool_usage',
      action: 'generate_paystubs_clicked',
      businessValue: 'medium'
    })

    // Validate form with Zod
    const validation = paystubFormSchema.safeParse({
      employeeName: paystubData.employeeName,
      hourlyRate: paystubData.hourlyRate,
      hoursPerPeriod: paystubData.hoursPerPeriod
    })

    // Convert Zod errors to FormErrors format
    const errors: FormErrors = {}
    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const path = issue.path[0]
        if (path === 'employeeName') {
          errors.employeeName = issue.message
        } else if (path === 'hourlyRate') {
          errors.hourlyRate = issue.message
        } else if (path === 'hoursPerPeriod') {
          errors.hoursPerPeriod = issue.message
        }
      }
    }

    setFormErrors(errors)

    if (!validation.success) {
      logger.warn('Form validation failed in page component', {
        component: 'PaystubGeneratorPage',
        userFlow: 'paystub_tool_usage',
        validationErrors: errors,
        zodIssues: validation.error.issues,
        action: 'validation_failed'
      })
      toast.error('Please fix the form errors before generating payroll records')
      return
    }

    setIsGenerating(true)
    const loadingToast = toast.loading('Generating payroll records...')

    try {
      const grossPay = paystubData.hourlyRate * paystubData.hoursPerPeriod
      // Generate pay dates (simplified for now)
      const payDates: Date[] = []
      const annualGross = grossPay * 26

      const totals = {
        hours: 0,
        grossPay: 0,
        federalTax: 0,
        socialSecurity: 0,
        medicare: 0,
        otherDeductions: 0,
        netPay: 0
      }

      const newPayPeriods: PayPeriod[] = []

      for (let i = 0; i < 26; i++) {
        const ytdGross = grossPay * i

        const federalTax = calculateFederalTax(grossPay, paystubData.filingStatus as keyof TaxData['federalBrackets'], annualGross, paystubData.taxYear)
        const socialSecurity = calculateSocialSecurity(grossPay, ytdGross, paystubData.taxYear)
        const medicare = calculateMedicare(grossPay, ytdGross, paystubData.filingStatus as keyof TaxData['additionalMedicareThreshold'], paystubData.taxYear)
        const otherDeductions = 0

        const netPay = grossPay - federalTax - socialSecurity - medicare - otherDeductions

        const payPeriod: PayPeriod = {
          period: i + 1,
          payDate: payDates[i]?.toISOString() || `2024-01-01`, // Fallback date if undefined
          hours: paystubData.hoursPerPeriod,
          grossPay,
          federalTax,
          socialSecurity,
          medicare,
          otherDeductions,
          netPay
        }

        newPayPeriods.push(payPeriod)

        totals.hours += paystubData.hoursPerPeriod
        totals.grossPay += grossPay
        totals.federalTax += federalTax
        totals.socialSecurity += socialSecurity
        totals.medicare += medicare
        totals.otherDeductions += otherDeductions
        totals.netPay += netPay
      }

      setPaystubData(prev => ({
        ...prev,
        payPeriods: newPayPeriods,
        totals
      }))

      setResultsVisible(true)
      toast.dismiss(loadingToast)
      toast.success('Payroll records generated successfully!')

      // End performance tracking
      logger.timeEnd('paystub-generation')

      // Track successful generation
      logger.info('Payroll generation completed successfully in page component', {
        component: 'PaystubGeneratorPage',
        userFlow: 'paystub_tool_usage',
        action: 'generation_completed',
        businessValue: 'high',
        toolUsage: {
          payPeriodsGenerated: newPayPeriods.length,
          employeeName: !!paystubData.employeeName,
          employeeId: !!paystubData.employeeId,
          employerName: !!paystubData.employerName,
          state: selectedState || 'none_selected',
          totalGrossPay: totals.grossPay,
          totalNetPay: totals.netPay
        }
      })

      // Scroll to results
      setTimeout(() => {
        const resultsSection = document.getElementById('resultsSection')
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error('Failed to generate payroll records. Please check your input values.')
      logger.error('Payroll generation failed in page component', {
        error,
        component: 'PaystubGeneratorPage',
        action: 'generatePaystubs',
        userFlow: 'paystub_tool_usage',
        performance: {
          formValidation: 'passed',
          calculationAttempted: true
        },
        formData: {
          employeeName: paystubData.employeeName,
          hourlyRate: paystubData.hourlyRate,
          hoursPerPeriod: paystubData.hoursPerPeriod,
          filingStatus: paystubData.filingStatus,
          taxYear: paystubData.taxYear,
          selectedState: selectedState
        }
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateIndividualPaystub = () => {
    if (!resultsVisible) {
      logger.warn('Individual paystub generation attempted without payroll data', {
        component: 'PaystubGeneratorPage',
        userFlow: 'paystub_tool_usage',
        action: 'individual_paystub_blocked',
        reason: 'no_payroll_data'
      })
      toast.error('Please generate payroll records first')
      return
    }

    logger.info('Individual paystub view requested', {
      component: 'PaystubGeneratorPage',
      userFlow: 'paystub_tool_usage',
      action: 'individual_paystub_viewed',
      businessValue: 'medium',
      selectedPeriod: selectedPeriod
    })

    setDocumentType('paystub')
    toast.info('Individual paystub ready to view and print')
  }

  const generateAnnualSummary = () => {
    if (!resultsVisible) {
      logger.warn('Annual summary generation attempted without payroll data', {
        component: 'PaystubGeneratorPage',
        userFlow: 'paystub_tool_usage',
        action: 'annual_summary_blocked',
        reason: 'no_payroll_data'
      })
      toast.error('Please generate payroll records first')
      return
    }

    logger.info('Annual wage summary view requested', {
      component: 'PaystubGeneratorPage',
      userFlow: 'paystub_tool_usage',
      action: 'annual_summary_viewed',
      businessValue: 'medium',
      toolUsage: {
        totalGrossPay: paystubData.totals.grossPay,
        totalNetPay: paystubData.totals.netPay,
        taxYear: paystubData.taxYear
      }
    })

    setDocumentType('annual')
    toast.info('Annual wage summary ready to view and print')
  }

  const backToForm = () => {
    setDocumentType('form')
  }

  // Render individual pay stub
 if (documentType === 'paystub' && resultsVisible) {
    const selectedPayPeriod = paystubData.payPeriods[selectedPeriod - 1]

    // Handle case where selectedPayPeriod is undefined
    if (!selectedPayPeriod) {
      return (
        <div>
          <div className="p-5 text-center bg-muted">
            <button
              onClick={backToForm}
              className="px-5 py-2.5 mr-2.5 bg-muted-foreground text-primary-foreground border-0 rounded cursor-pointer hover:bg-muted transition-smooth"
            >
              ← Back to Form
            </button>
          </div>
          <div className="p-5 text-center">
            <p>Pay period data not available. Please generate payroll records first.</p>
          </div>
        </div>
      )
    }

    const ytdTotals = {
      grossPay: paystubData.totals.grossPay * (selectedPeriod / 26),
      federalTax: paystubData.totals.federalTax * (selectedPeriod / 26),
      socialSecurity: paystubData.totals.socialSecurity * (selectedPeriod / 26),
      medicare: paystubData.totals.medicare * (selectedPeriod / 26),
      netPay: paystubData.totals.netPay * (selectedPeriod / 26)
    }

    return (
      <div>
        <div className="p-5 text-center bg-muted">
          <button
            onClick={backToForm}
            className="px-5 py-2.5 mr-2.5 bg-muted-foreground text-primary-foreground border-0 rounded cursor-pointer hover:bg-muted transition-smooth"
          >
            ← Back to Form
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-accent text-primary-foreground border-0 rounded cursor-pointer hover:bg-accent/90 transition-smooth"
          >
            Print Pay Stub
          </button>
        </div>
        <PayStub
          payPeriod={selectedPayPeriod}
          employeeData={paystubData}
          ytdTotals={ytdTotals}
        />
      </div>
    )
  }

  // Render annual summary
  if (documentType === 'annual' && resultsVisible) {
    return (
      <div>
        <div className="p-5 text-center bg-muted">
          <button
            onClick={backToForm}
            className="px-5 py-2.5 mr-2.5 bg-muted-foreground text-primary-foreground border-0 rounded cursor-pointer hover:bg-muted transition-smooth"
          >
            ← Back to Form
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-accent text-primary-foreground border-0 rounded cursor-pointer hover:bg-accent/90 transition-smooth"
          >
            Print Annual Summary
          </button>
        </div>
        <AnnualWageSummary employeeData={paystubData} />
      </div>
    )
  }

  return (
    <div className="m-0 p-5 box-border font-sans bg-primary/10 min-h-screen text-foreground">
      <div className="max-w-[1000px] mx-auto bg-card rounded-[var(--spacing-4)] shadow-[0_10px_30px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Header */}
        <div className="bg-[#2c3e50] text-primary-foreground text-center py-[var(--spacing-6)] px-5 border-b-[3px] border-[#34495e]">
          <h1 className="text-[var(--text-3xl)] mb-[var(--spacing-1)] font-semibold tracking-[1px]">PAYROLL RECORD SUMMARY</h1>
          <p className="text-base text-muted-foreground m-0">Tax Year {paystubData.taxYear}</p>
        </div>

        {/* Form Section */}
        <div className="p-[var(--spacing-8)] bg-muted border-b border-border">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5 mb-5">
            <div className="flex flex-col">
              <label className="font-semibold mb-subheading text-muted-foreground text-[var(--text-sm)]">
                Employee Name <span className="text-destructive">*</span>:
              </label>
              <input
                type="text"
                value={paystubData.employeeName}
                onChange={(e) => setPaystubData(prev => ({...prev, employeeName: e.target.value}))}
                placeholder="Enter full name"
                className={`p-3 ${formErrors.employeeName ? 'border-2 border-destructive' : 'border-2 border-border'} rounded-lg text-base`}
              />
              {formErrors.employeeName && (
                <span className="text-destructive text-[var(--text-sm)] mt-1">
                  {formErrors.employeeName}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-subheading text-muted-foreground text-[var(--text-sm)]">
                Employee ID/SSN (Optional):
              </label>
              <input
                type="text"
                value={paystubData.employeeId}
                onChange={(e) => setPaystubData(prev => ({...prev, employeeId: e.target.value}))}
                placeholder="XXX-XX-XXXX"
                className="p-3 border-2 border-border rounded-lg text-base"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-subheading text-muted-foreground text-[var(--text-sm)]">
                Employer Name (Optional):
              </label>
              <input
                type="text"
                value={paystubData.employerName}
                onChange={(e) => setPaystubData(prev => ({...prev, employerName: e.target.value}))}
                placeholder="Enter company name"
                className="p-3 border-2 border-border rounded-lg text-base"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-subheading text-muted-foreground text-[var(--text-sm)]">
                Hourly Rate ($) <span className="text-destructive">*</span>:
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={paystubData.hourlyRate || ''}
                onChange={(e) => setPaystubData(prev => ({...prev, hourlyRate: parseFloat(e.target.value) || 0}))}
                placeholder="Enter hourly rate"
                className={`p-3 ${formErrors.hourlyRate ? 'border-2 border-destructive' : 'border-2 border-border'} rounded-lg text-base`}
              />
              {formErrors.hourlyRate && (
                <span className="text-destructive text-[var(--text-sm)] mt-1">
                  {formErrors.hourlyRate}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-subheading text-muted-foreground text-[var(--text-sm)]">
                Hours Per Pay Period <span className="text-destructive">*</span>:
              </label>
              <input
                type="number"
                min="1"
                value={paystubData.hoursPerPeriod || ''}
                onChange={(e) => setPaystubData(prev => ({...prev, hoursPerPeriod: parseInt(e.target.value) || 0}))}
                placeholder="Enter hours per pay period"
                className={`p-3 ${formErrors.hoursPerPeriod ? 'border-2 border-destructive' : 'border-2 border-border'} rounded-lg text-base`}
              />
              {formErrors.hoursPerPeriod && (
                <span className="text-destructive text-[var(--text-sm)] mt-1">
                  {formErrors.hoursPerPeriod}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-subheading text-muted-foreground text-[var(--text-sm)]">
                Filing Status:
              </label>
              <select
                value={paystubData.filingStatus}
                onChange={(e) => setPaystubData(prev => ({...prev, filingStatus: e.target.value as FilingStatus}))}
                className="p-3 border-2 border-border rounded-lg text-base bg-card text-muted-foreground"
              >
                <option value="single">Single</option>
                <option value="marriedJoint">Married filing jointly</option>
                <option value="marriedSeparate">Married filing separately</option>
                <option value="headOfHousehold">Head of household</option>
                <option value="qualifyingSurvivingSpouse">Qualifying surviving spouse</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-subheading text-muted-foreground text-[var(--text-sm)]">
                Tax Year:
              </label>
              <select
                value={paystubData.taxYear}
                onChange={(e) => setPaystubData(prev => ({...prev, taxYear: parseInt(e.target.value)}))}
                className="p-3 border-2 border-border rounded-lg text-base bg-card text-muted-foreground"
              >
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-subheading text-muted-foreground text-[var(--text-sm)]">
                State (Optional):
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="p-3 border-2 border-border rounded-lg text-base bg-card text-muted-foreground"
              >
                <option value="">Select state...</option>
                <optgroup label="No State Income Tax">
                  {getNoIncomeTaxStates().map(state => (
                    <option key={state.value} value={state.value}>
                      {state.label} (No state tax)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="States with Income Tax">
                  {getIncomeTaxStates().map(state => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          <div className="flex gap-[var(--spacing-4)] items-center">
            <button
              onClick={generatePaystubs}
              disabled={isGenerating}
              className={`flex-1 p-[var(--spacing-4)] ${isGenerating ? 'bg-muted-foreground' : 'bg-[#2c3e50]'} text-primary-foreground border-0 rounded-lg text-[var(--text-lg)] font-semibold ${isGenerating ? 'cursor-not-allowed' : 'cursor-pointer'} shadow-[0_4px_15px_rgba(44,62,80,0.3)] ${isGenerating ? 'opacity-70' : 'opacity-100'} transition-smooth`}
            >
              {isGenerating ? 'Generating...' : 'Generate Payroll Records'}
            </button>
            <button
              onClick={handleClearForm}
              className="py-[var(--spacing-4)] px-[var(--spacing-6)] bg-muted-foreground text-primary-foreground border-0 rounded-lg text-base font-semibold cursor-pointer shadow-[0_4px_15px_rgba(108,117,125,0.3)] hover:bg-[#5a6268] transition-smooth"
            >
              Clear Form
            </button>
          </div>
        </div>

        {/* Results Section */}
        {resultsVisible && (
          <div id="resultsSection" className="p-[var(--spacing-8)] block">
            {/* Summary Cards */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5 mb-[var(--spacing-8)]">
              <div className="bg-card rounded-xl p-5 shadow-[0_5px_15px_rgba(0,0,0,0.05)] border-t-4 border-success">
                <h3 className="text-foreground mb-[var(--spacing-4)] text-center text-[var(--text-lg)] font-semibold tracking-[0.5px]">
                  YEAR-TO-DATE EARNINGS
                </h3>
                <div className="flex-between py-2.5 px-0 border-b border-border">
                  <span>Total Hours:</span>
                  <span>{paystubData.totals.hours}</span>
                </div>
                <div className="flex-between py-2.5 px-0">
                  <span>Regular Wages:</span>
                  <span>{formatCurrency(paystubData.totals.grossPay)}</span>
                </div>
                <div className="flex-between py-2.5 px-0">
                  <span>Gross Earnings (Subtotal):</span>
                  <span>{formatCurrency(paystubData.totals.grossPay)}</span>
                </div>
                <div className="flex-between py-[var(--spacing-4)] px-0 border-t border-border font-bold text-[var(--text-lg)]">
                  <span>TOTAL GROSS INCOME:</span>
                  <span>{formatCurrency(paystubData.totals.grossPay)}</span>
                </div>
              </div>

              <div className="bg-card rounded-xl p-5 shadow-[0_5px_15px_rgba(0,0,0,0.05)] border-t-4 border-success">
                <h3 className="text-foreground mb-[var(--spacing-4)] text-center text-[var(--text-lg)] font-semibold tracking-[0.5px]">
                  YEAR-TO-DATE DEDUCTIONS
                </h3>
                <div className="flex-between py-2.5 px-0 border-b border-border">
                  <span>Social Security Tax (6.2%):</span>
                  <span>{formatCurrency(paystubData.totals.socialSecurity)}</span>
                </div>
                <div className="flex-between py-2.5 px-0 border-b border-border">
                  <span>Medicare Tax (1.45%):</span>
                  <span>{formatCurrency(paystubData.totals.medicare)}</span>
                </div>
                <div className="flex-between py-2.5 px-0 border-b border-border">
                  <span>Additional Medicare Tax (0.9%):</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="flex-between py-2.5 px-0 border-b border-border">
                  <span>Other Deductions:</span>
                  <span>{formatCurrency(paystubData.totals.otherDeductions)}</span>
                </div>
                <div className="flex-between py-2.5 px-0 border-b border-border">
                  <span>Total Deductions:</span>
                  <span>{formatCurrency(paystubData.totals.federalTax + paystubData.totals.socialSecurity + paystubData.totals.medicare)}</span>
                </div>
                <div className="flex-between py-[var(--spacing-4)] px-0 border-t border-border font-bold text-[var(--text-lg)]">
                  <span>NET PAY:</span>
                  <span>{formatCurrency(paystubData.totals.netPay)}</span>
                </div>
              </div>
            </div>

            {/* Pay Periods Table */}
            <div>
              <h3 className="text-foreground mb-5 text-center text-[var(--text-xl)] font-semibold tracking-[0.5px]">
                PAYROLL PERIODS (BI-WEEKLY - 26 PERIODS PER YEAR)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-card shadow-[0_5px_15px_rgba(0,0,0,0.05)] rounded-lg overflow-hidden">
                  <thead>
                    <tr>
                      <th className="bg-success text-primary-foreground py-[var(--spacing-4)] px-2.5 text-center font-semibold">
                        Period
                      </th>
                      <th className="bg-success text-primary-foreground py-[var(--spacing-4)] px-2.5 text-center font-semibold">
                        Pay Date
                      </th>
                      <th className="bg-success text-primary-foreground py-[var(--spacing-4)] px-2.5 text-center font-semibold">
                        Hours
                      </th>
                      <th className="bg-success text-primary-foreground py-[var(--spacing-4)] px-2.5 text-center font-semibold">
                        Gross Pay
                      </th>
                      <th className="bg-success text-primary-foreground py-[var(--spacing-4)] px-2.5 text-center font-semibold">
                        Fed Tax
                      </th>
                      <th className="bg-success text-primary-foreground py-[var(--spacing-4)] px-2.5 text-center font-semibold">
                        Social Security
                      </th>
                      <th className="bg-success text-primary-foreground py-[var(--spacing-4)] px-2.5 text-center font-semibold">
                        Medicare
                      </th>
                      <th className="bg-success text-primary-foreground py-[var(--spacing-4)] px-2.5 text-center font-semibold">
                        Other Deductions
                      </th>
                      <th className="bg-success text-primary-foreground py-[var(--spacing-4)] px-2.5 text-center font-semibold">
                        Net Pay
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paystubData.payPeriods.map((period, index) => (
                      <tr key={period.period} className={index % 2 === 0 ? 'bg-muted' : 'bg-card'}>
                        <td className="py-3 px-2.5 text-center border-b border-border">
                          {period.period}
                        </td>
                        <td className="py-3 px-2.5 text-center border-b border-border">
                          {formatDate(period.payDate)}
                        </td>
                        <td className="py-3 px-2.5 text-center border-b border-border">
                          {period.hours}
                        </td>
                        <td className="py-3 px-2.5 text-center border-b border-border">
                          {formatCurrency(period.grossPay)}
                        </td>
                        <td className="py-3 px-2.5 text-center border-b border-border">
                          {formatCurrency(period.federalTax)}
                        </td>
                        <td className="py-3 px-2.5 text-center border-b border-border">
                          {formatCurrency(period.socialSecurity)}
                        </td>
                        <td className="py-3 px-2.5 text-center border-b border-border">
                          {formatCurrency(period.medicare)}
                        </td>
                        <td className="py-3 px-2.5 text-center border-b border-border">
                          {formatCurrency(period.otherDeductions)}
                        </td>
                        <td className="py-3 px-2.5 text-center border-b border-border">
                          {formatCurrency(period.netPay)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* W-2 Tax Document Information */}
            <div className="my-[var(--spacing-8)] mx-0 bg-primary/10 p-[var(--spacing-6)] rounded-xl border-2 border-warning">
              <h3 className="text-foreground text-center mb-5 text-[var(--text-xl)] font-semibold tracking-[0.5px]">
                W-2 TAX DOCUMENT INFORMATION
              </h3>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[var(--spacing-4)]">
                <div className="flex-between p-[var(--spacing-4)] bg-card rounded-lg border-l-4 border-warning">
                  <span>Box 1 - Wages, tips, other compensation:</span>
                  <span>{formatCurrency(paystubData.totals.grossPay)}</span>
                </div>
                <div className="flex-between p-[var(--spacing-4)] bg-card rounded-lg border-l-4 border-warning">
                  <span>Box 2 - Federal income tax withheld:</span>
                  <span>{formatCurrency(paystubData.totals.federalTax)}</span>
                </div>
                <div className="flex-between p-[var(--spacing-4)] bg-card rounded-lg border-l-4 border-warning">
                  <span>Box 3 - Social security wages:</span>
                  <span>{formatCurrency(Math.min(paystubData.totals.grossPay, getCurrentTaxData()?.ssWageBase || 0))}</span>
                </div>
                <div className="flex-between p-[var(--spacing-4)] bg-card rounded-lg border-l-4 border-warning">
                  <span>Box 4 - Social security tax withheld:</span>
                  <span>{formatCurrency(paystubData.totals.socialSecurity)}</span>
                </div>
                <div className="flex-between p-[var(--spacing-4)] bg-card rounded-lg border-l-4 border-warning">
                  <span>Box 5 - Medicare wages and tips:</span>
                  <span>{formatCurrency(paystubData.totals.grossPay)}</span>
                </div>
                <div className="flex-between p-[var(--spacing-4)] bg-card rounded-lg border-l-4 border-warning">
                  <span>Box 6 - Medicare tax withheld:</span>
                  <span>{formatCurrency(paystubData.totals.medicare)}</span>
                </div>
              </div>
            </div>

            {/* Individual Paystub Generator */}
            <div className="bg-primary/10 p-[var(--spacing-6)] rounded-xl border-2 border-success">
              <h3 className="text-foreground text-center mb-[var(--spacing-4)] text-[var(--text-xl)] font-semibold tracking-[0.5px]">
                INDIVIDUAL PAYSTUB GENERATOR
              </h3>
              <p className="text-center mb-[var(--spacing-4)] text-success-darker">
                Generate individual paystubs for rental applications, loan approvals,
                or income verification purposes.
              </p>
              <div className="flex-center gap-[var(--spacing-4)] flex-wrap">
                <div>
                  <label className="mr-2.5 font-semibold">Select Pay Period:</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                    className="py-2 px-3 rounded-md border border-border"
                  >
                    {paystubData.payPeriods.map(period => (
                      <option key={period.period} value={period.period}>
                        Period {period.period} - {formatDate(period.payDate)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-center gap-tight.5 mt-5">
                <button
                  onClick={generateIndividualPaystub}
                  className="bg-primary/10 text-primary-foreground border-0 py-3 px-[var(--spacing-8)] rounded-lg font-semibold cursor-pointer"
                >
                  Generate Individual Paystub
                </button>
                <button
                  onClick={generateAnnualSummary}
                  className="bg-primary/10 text-primary-foreground border-0 py-3 px-[var(--spacing-8)] rounded-lg font-semibold cursor-pointer"
                >
                  Generate Annual Summary
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
