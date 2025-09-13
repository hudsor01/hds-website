'use client'

import { usePaystubGenerator } from '@/hooks/usePaystubGenerator'
import { PaystubForm } from '@/components/paystub/PaystubForm'
import { PaystubNavigation } from '@/components/paystub/PaystubNavigation'
import { PayStub } from '@/components/PayStub'
import { AnnualWageSummary } from '@/components/AnnualWageSummary'

export default function PaystubGeneratorPage() {
  const {
    paystubData,
    setPaystubData,
    selectedState,
    setSelectedState,
    resultsVisible,
    selectedPeriod,
    setSelectedPeriod,
    documentType,
    setDocumentType,
    formErrors,
    isGenerating,
    handleClearForm,
    generatePaystubs,
    handlePrint,
    backToForm
  } = usePaystubGenerator()

  // Render form
  if (documentType === 'form' || !resultsVisible) {
    return (
      <PaystubForm
        paystubData={paystubData}
        setPaystubData={setPaystubData}
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        formErrors={formErrors}
        onGenerate={generatePaystubs}
        onClear={handleClearForm}
        isGenerating={isGenerating}
      />
    )
  }

  // Render individual pay stub
  if (documentType === 'paystub' && resultsVisible) {
    const selectedPayPeriod = paystubData.payPeriods[selectedPeriod - 1]
    if (!selectedPayPeriod) {
      return null
    }

    const ytdTotals = {
      grossPay: paystubData.totals.grossPay * (selectedPeriod / 26),
      federalTax: paystubData.totals.federalTax * (selectedPeriod / 26),
      socialSecurity: paystubData.totals.socialSecurity * (selectedPeriod / 26),
      medicare: paystubData.totals.medicare * (selectedPeriod / 26),
      otherDeductions: paystubData.totals.otherDeductions * (selectedPeriod / 26),
      netPay: paystubData.totals.netPay * (selectedPeriod / 26)
    }

    return (
      <div>
        <PaystubNavigation
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          documentType={documentType}
          setDocumentType={setDocumentType}
          onBackToForm={backToForm}
          onPrint={handlePrint}
        />
        <PayStub
          payPeriod={selectedPayPeriod}
          employeeData={paystubData}
          ytdTotals={ytdTotals}
        />
      </div>
    )
  }

  // Render annual summary (W-2)
  if (documentType === 'annual' && resultsVisible) {
    return (
      <div>
        <PaystubNavigation
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          documentType={documentType}
          setDocumentType={setDocumentType}
          onBackToForm={backToForm}
          onPrint={handlePrint}
        />
        <AnnualWageSummary employeeData={paystubData} />
      </div>
    )
  }

  return null
}