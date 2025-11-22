'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import type { PaystubData, PayPeriod, TaxData, FilingStatus } from '@/types/paystub'
import { getCurrentTaxData } from '@/lib/paystub-utils'
import { calculateFederalTax, calculateSocialSecurity, calculateMedicare } from '@/lib/tax-calculations'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PayStub } from '@/components/PayStub'
import { AnnualWageSummary } from '@/components/AnnualWageSummary'
import { saveFormData, loadFormData, clearFormData } from '@/lib/storage'
import { getNoIncomeTaxStates, getIncomeTaxStates } from '@/lib/states-utils'
import type { FormErrors } from '@/types/common'
import { logger } from '@/lib/logger'
import { paystubFormSchema } from '@/lib/schemas'

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
          <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
            <button
              onClick={backToForm}
              style={{
                padding: '10px 20px',
                marginRight: '10px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              ← Back to Form
            </button>
          </div>
          <div style={{ padding: '20px', textAlign: 'center' }}>
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
        <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
          <button
            onClick={backToForm}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ← Back to Form
          </button>
          <button
            onClick={() => window.print()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
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
        <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
          <button
            onClick={backToForm}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ← Back to Form
          </button>
          <button
            onClick={() => window.print()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Print Annual Summary
          </button>
        </div>
        <AnnualWageSummary employeeData={paystubData} />
      </div>
    )
  }

  return (
    <div style={{
      margin: 0,
      padding: '20px',
      boxSizing: 'border-box',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      color: '#333'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: '#2c3e50',
          color: 'white',
          textAlign: 'center',
          padding: '25px 20px',
          borderBottom: '3px solid #34495e'
        }}>
          <h1 style={{
            fontSize: '1.8rem',
            marginBottom: '5px',
            fontWeight: '600',
            letterSpacing: '1px'
          }}>PAYROLL RECORD SUMMARY</h1>
          <p style={{
            fontSize: '1rem',
            color: '#bdc3c7',
            margin: 0
          }}>Tax Year {paystubData.taxYear}</p>
        </div>

        {/* Form Section */}
        <div style={{
          padding: '30px',
          background: '#f8f9fa',
          borderBottom: '1px solid #e9ecef'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{
                fontWeight: 600,
                marginBottom: '8px',
                color: '#495057',
                fontSize: '0.9rem'
              }}>Employee Name <span style={{ color: '#dc3545' }}>*</span>:</label>
              <input
                type="text"
                value={paystubData.employeeName}
                onChange={(e) => setPaystubData(prev => ({...prev, employeeName: e.target.value}))}
                placeholder="Enter full name"
                style={{
                  padding: '12px 15px',
                  border: formErrors.employeeName ? '2px solid #dc3545' : '2px solid #dee2e6',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              {formErrors.employeeName && (
                <span style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '4px' }}>
                  {formErrors.employeeName}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{
                fontWeight: 600,
                marginBottom: '8px',
                color: '#495057',
                fontSize: '0.9rem'
              }}>Employee ID/SSN (Optional):</label>
              <input
                type="text"
                value={paystubData.employeeId}
                onChange={(e) => setPaystubData(prev => ({...prev, employeeId: e.target.value}))}
                placeholder="XXX-XX-XXXX"
                style={{
                  padding: '12px 15px',
                  border: '2px solid #dee2e6',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{
                fontWeight: 600,
                marginBottom: '8px',
                color: '#495057',
                fontSize: '0.9rem'
              }}>Employer Name (Optional):</label>
              <input
                type="text"
                value={paystubData.employerName}
                onChange={(e) => setPaystubData(prev => ({...prev, employerName: e.target.value}))}
                placeholder="Enter company name"
                style={{
                  padding: '12px 15px',
                  border: '2px solid #dee2e6',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{
                fontWeight: 600,
                marginBottom: '8px',
                color: '#495057',
                fontSize: '0.9rem'
              }}>Hourly Rate ($) <span style={{ color: '#dc3545' }}>*</span>:</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={paystubData.hourlyRate || ''}
                onChange={(e) => setPaystubData(prev => ({...prev, hourlyRate: parseFloat(e.target.value) || 0}))}
                placeholder="Enter hourly rate"
                style={{
                  padding: '12px 15px',
                  border: formErrors.hourlyRate ? '2px solid #dc3545' : '2px solid #dee2e6',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              {formErrors.hourlyRate && (
                <span style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '4px' }}>
                  {formErrors.hourlyRate}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{
                fontWeight: 600,
                marginBottom: '8px',
                color: '#495057',
                fontSize: '0.9rem'
              }}>Hours Per Pay Period <span style={{ color: '#dc3545' }}>*</span>:</label>
              <input
                type="number"
                min="1"
                value={paystubData.hoursPerPeriod || ''}
                onChange={(e) => setPaystubData(prev => ({...prev, hoursPerPeriod: parseInt(e.target.value) || 0}))}
                placeholder="Enter hours per pay period"
                style={{
                  padding: '12px 15px',
                  border: formErrors.hoursPerPeriod ? '2px solid #dc3545' : '2px solid #dee2e6',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              {formErrors.hoursPerPeriod && (
                <span style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '4px' }}>
                  {formErrors.hoursPerPeriod}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{
                fontWeight: 600,
                marginBottom: '8px',
                color: '#495057',
                fontSize: '0.9rem'
              }}>Filing Status:</label>
              <select
                value={paystubData.filingStatus}
                onChange={(e) => setPaystubData(prev => ({...prev, filingStatus: e.target.value as FilingStatus}))}
                style={{
                  padding: '12px 15px',
                  border: '2px solid #dee2e6',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  color: '#495057'
                }}
              >
                <option value="single">Single</option>
                <option value="marriedJoint">Married filing jointly</option>
                <option value="marriedSeparate">Married filing separately</option>
                <option value="headOfHousehold">Head of household</option>
                <option value="qualifyingSurvivingSpouse">Qualifying surviving spouse</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{
                fontWeight: 600,
                marginBottom: '8px',
                color: '#495057',
                fontSize: '0.9rem'
              }}>Tax Year:</label>
              <select
                value={paystubData.taxYear}
                onChange={(e) => setPaystubData(prev => ({...prev, taxYear: parseInt(e.target.value)}))}
                style={{
                  padding: '12px 15px',
                  border: '2px solid #dee2e6',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  color: '#495057'
                }}
              >
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{
                fontWeight: 600,
                marginBottom: '8px',
                color: '#495057',
                fontSize: '0.9rem'
              }}>State (Optional):</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                style={{
                  padding: '12px 15px',
                  border: '2px solid #dee2e6',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  color: '#495057'
                }}
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

          <div style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'center'
          }}>
            <button
              onClick={generatePaystubs}
              disabled={isGenerating}
              style={{
                flex: 1,
                padding: '15px',
                background: isGenerating ? '#6c757d' : '#2c3e50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(44,62,80,0.3)',
                opacity: isGenerating ? 0.7 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {isGenerating ? 'Generating...' : 'Generate Payroll Records'}
            </button>
            <button
              onClick={handleClearForm}
              style={{
                padding: '15px 25px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(108,117,125,0.3)',
                transition: 'background 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#5a6268'}
              onMouseOut={(e) => e.currentTarget.style.background = '#6c757d'}
            >
              Clear Form
            </button>
          </div>
        </div>

        {/* Results Section */}
        {resultsVisible && (
          <div id="resultsSection" style={{ padding: '30px', display: 'block' }}>
            {/* Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                borderTop: '4px solid #4CAF50'
              }}>
                <h3 style={{
                  color: '#2c3e50',
                  marginBottom: '15px',
                  textAlign: 'center',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  letterSpacing: '0.5px'
                }}>YEAR-TO-DATE EARNINGS</h3>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #eee'
                }}>
                  <span>Total Hours:</span>
                  <span>{paystubData.totals.hours}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0'
                }}>
                  <span>Regular Wages:</span>
                  <span>{formatCurrency(paystubData.totals.grossPay)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0'
                }}>
                  <span>Gross Earnings (Subtotal):</span>
                  <span>{formatCurrency(paystubData.totals.grossPay)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '15px 0',
                  borderTop: '1px solid #eee',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}>
                  <span>TOTAL GROSS INCOME:</span>
                  <span>{formatCurrency(paystubData.totals.grossPay)}</span>
                </div>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                borderTop: '4px solid #4CAF50'
              }}>
                <h3 style={{
                  color: '#2c3e50',
                  marginBottom: '15px',
                  textAlign: 'center',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  letterSpacing: '0.5px'
                }}>YEAR-TO-DATE DEDUCTIONS</h3>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #eee'
                }}>
                  <span>Social Security Tax (6.2%):</span>
                  <span>{formatCurrency(paystubData.totals.socialSecurity)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #eee'
                }}>
                  <span>Medicare Tax (1.45%):</span>
                  <span>{formatCurrency(paystubData.totals.medicare)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #eee'
                }}>
                  <span>Additional Medicare Tax (0.9%):</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #eee'
                }}>
                  <span>Other Deductions:</span>
                  <span>{formatCurrency(paystubData.totals.otherDeductions)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #eee'
                }}>
                  <span>Total Deductions:</span>
                  <span>{formatCurrency(paystubData.totals.federalTax + paystubData.totals.socialSecurity + paystubData.totals.medicare)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '15px 0',
                  borderTop: '1px solid #eee',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}>
                  <span>NET PAY:</span>
                  <span>{formatCurrency(paystubData.totals.netPay)}</span>
                </div>
              </div>
            </div>

            {/* Pay Periods Table */}
            <div>
              <h3 style={{
                color: '#2c3e50',
                marginBottom: '20px',
                textAlign: 'center',
                fontSize: '1.2rem',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>PAYROLL PERIODS (BI-WEEKLY - 26 PERIODS PER YEAR)</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  background: 'white',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <thead>
                    <tr>
                      <th style={{
                        background: '#4CAF50',
                        color: 'white',
                        padding: '15px 10px',
                        textAlign: 'center',
                        fontWeight: 600
                      }}>Period</th>
                      <th style={{
                        background: '#4CAF50',
                        color: 'white',
                        padding: '15px 10px',
                        textAlign: 'center',
                        fontWeight: 600
                      }}>Pay Date</th>
                      <th style={{
                        background: '#4CAF50',
                        color: 'white',
                        padding: '15px 10px',
                        textAlign: 'center',
                        fontWeight: 600
                      }}>Hours</th>
                      <th style={{
                        background: '#4CAF50',
                        color: 'white',
                        padding: '15px 10px',
                        textAlign: 'center',
                        fontWeight: 600
                      }}>Gross Pay</th>
                      <th style={{
                        background: '#4CAF50',
                        color: 'white',
                        padding: '15px 10px',
                        textAlign: 'center',
                        fontWeight: 600
                      }}>Fed Tax</th>
                      <th style={{
                        background: '#4CAF50',
                        color: 'white',
                        padding: '15px 10px',
                        textAlign: 'center',
                        fontWeight: 600
                      }}>Social Security</th>
                      <th style={{
                        background: '#4CAF50',
                        color: 'white',
                        padding: '15px 10px',
                        textAlign: 'center',
                        fontWeight: 600
                      }}>Medicare</th>
                      <th style={{
                        background: '#4CAF50',
                        color: 'white',
                        padding: '15px 10px',
                        textAlign: 'center',
                        fontWeight: 600
                      }}>Other Deductions</th>
                      <th style={{
                        background: '#4CAF50',
                        color: 'white',
                        padding: '15px 10px',
                        textAlign: 'center',
                        fontWeight: 600
                      }}>Net Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paystubData.payPeriods.map((period, index) => (
                      <tr key={period.period} style={{
                        backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                      }}>
                        <td style={{
                          padding: '12px 10px',
                          textAlign: 'center',
                          borderBottom: '1px solid #e0e0e0'
                        }}>{period.period}</td>
                        <td style={{
                          padding: '12px 10px',
                          textAlign: 'center',
                          borderBottom: '1px solid #e0e0e0'
                        }}>{formatDate(period.payDate)}</td>
                        <td style={{
                          padding: '12px 10px',
                          textAlign: 'center',
                          borderBottom: '1px solid #e0e0e0'
                        }}>{period.hours}</td>
                        <td style={{
                          padding: '12px 10px',
                          textAlign: 'center',
                          borderBottom: '1px solid #e0e0e0'
                        }}>{formatCurrency(period.grossPay)}</td>
                        <td style={{
                          padding: '12px 10px',
                          textAlign: 'center',
                          borderBottom: '1px solid #e0e0e0'
                        }}>{formatCurrency(period.federalTax)}</td>
                        <td style={{
                          padding: '12px 10px',
                          textAlign: 'center',
                          borderBottom: '1px solid #e0e0e0'
                        }}>{formatCurrency(period.socialSecurity)}</td>
                        <td style={{
                          padding: '12px 10px',
                          textAlign: 'center',
                          borderBottom: '1px solid #e0e0e0'
                        }}>{formatCurrency(period.medicare)}</td>
                        <td style={{
                          padding: '12px 10px',
                          textAlign: 'center',
                          borderBottom: '1px solid #e0e0e0'
                        }}>{formatCurrency(period.otherDeductions)}</td>
                        <td style={{
                          padding: '12px 10px',
                          textAlign: 'center',
                          borderBottom: '1px solid #e0e0e0'
                        }}>{formatCurrency(period.netPay)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* W-2 Tax Document Information */}
            <div style={{
              margin: '30px 0',
              background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
              padding: '25px',
              borderRadius: '12px',
              border: '2px solid #ffc107'
            }}>
              <h3 style={{
                color: '#2c3e50',
                textAlign: 'center',
                marginBottom: '20px',
                fontSize: '1.2rem',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>W-2 TAX DOCUMENT INFORMATION</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '15px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '15px',
                  background: 'white',
                  borderRadius: '8px',
                  borderLeft: '4px solid #ffc107'
                }}>
                  <span>Box 1 - Wages, tips, other compensation:</span>
                  <span>{formatCurrency(paystubData.totals.grossPay)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '15px',
                  background: 'white',
                  borderRadius: '8px',
                  borderLeft: '4px solid #ffc107'
                }}>
                  <span>Box 2 - Federal income tax withheld:</span>
                  <span>{formatCurrency(paystubData.totals.federalTax)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '15px',
                  background: 'white',
                  borderRadius: '8px',
                  borderLeft: '4px solid #ffc107'
                }}>
                  <span>Box 3 - Social security wages:</span>
                  <span>{formatCurrency(Math.min(paystubData.totals.grossPay, getCurrentTaxData()?.ssWageBase || 0))}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '15px',
                  background: 'white',
                  borderRadius: '8px',
                  borderLeft: '4px solid #ffc107'
                }}>
                  <span>Box 4 - Social security tax withheld:</span>
                  <span>{formatCurrency(paystubData.totals.socialSecurity)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '15px',
                  background: 'white',
                  borderRadius: '8px',
                  borderLeft: '4px solid #ffc107'
                }}>
                  <span>Box 5 - Medicare wages and tips:</span>
                  <span>{formatCurrency(paystubData.totals.grossPay)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '15px',
                  background: 'white',
                  borderRadius: '8px',
                  borderLeft: '4px solid #ffc107'
                }}>
                  <span>Box 6 - Medicare tax withheld:</span>
                  <span>{formatCurrency(paystubData.totals.medicare)}</span>
                </div>
              </div>
            </div>

            {/* Individual Paystub Generator */}
            <div style={{
              background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
              padding: '25px',
              borderRadius: '12px',
              border: '2px solid #4CAF50'
            }}>
              <h3 style={{
                color: '#2c3e50',
                textAlign: 'center',
                marginBottom: '15px',
                fontSize: '1.2rem',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>INDIVIDUAL PAYSTUB GENERATOR</h3>
              <p style={{
                textAlign: 'center',
                marginBottom: '15px',
                color: '#2E7D32'
              }}>
                Generate individual paystubs for rental applications, loan approvals,
                or income verification purposes.
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '15px',
                flexWrap: 'wrap'
              }}>
                <div>
                  <label style={{ marginRight: '10px', fontWeight: 600 }}>Select Pay Period:</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #ccc'
                    }}
                  >
                    {paystubData.payPeriods.map(period => (
                      <option key={period.period} value={period.period}>
                        Period {period.period} - {formatDate(period.payDate)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '20px'
              }}>
                <button
                  onClick={generateIndividualPaystub}
                  style={{
                    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 30px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Generate Individual Paystub
                </button>
                <button
                  onClick={generateAnnualSummary}
                  style={{
                    background: 'linear-gradient(135deg, #6f42c1 0%, #5a2d91 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 30px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
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
