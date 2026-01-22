'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Share2 } from 'lucide-react'

import { AnnualWageSummary } from '@/components/paystub/AnnualWageSummary'
import { PayStub } from '@/components/paystub/PayStub'
import { PaystubForm } from '@/components/paystub/PaystubForm'
import { PaystubNavigation } from '@/components/paystub/PaystubNavigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePaystubGenerator } from '@/hooks/use-paystub-generator'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PaystubData, PayFrequency } from '@/types/paystub'
import { payPeriodsToCsv } from '@/lib/paystub-calculator/csv'

const PAY_PERIODS_BY_FREQUENCY: Record<PayFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
}

export function PaystubPageClient() {
  const {
    paystubData,
    setPaystubData,
    selectedState,
    setSelectedState,
    payFrequency,
    setPayFrequency,
    overtimeHours,
    setOvertimeHours,
    overtimeRate,
    setOvertimeRate,
    additionalDeductions,
    setAdditionalDeductions,
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
    backToForm,
    generateShareableUrl,
  } = usePaystubGenerator()

  const handleShare = async () => {
    const url = generateShareableUrl()
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } catch {
      // Fallback for browsers without clipboard API
      toast.info('Copy this URL to share:', { description: url })
    }
  }

  const hasFormData = paystubData.employeeName || paystubData.hourlyRate || paystubData.hoursPerPeriod

  const [showTable, setShowTable] = useState(false)

  const selectedPayPeriod = paystubData.payPeriods[selectedPeriod - 1]
  const ytdTotals = useMemo(() => {
    if (!selectedPayPeriod) {
      return null
    }
    return paystubData.payPeriods.slice(0, selectedPeriod).reduce(
      (acc, period) => ({
        grossPay: acc.grossPay + period.grossPay,
        federalTax: acc.federalTax + period.federalTax,
        socialSecurity: acc.socialSecurity + period.socialSecurity,
        medicare: acc.medicare + period.medicare,
        netPay: acc.netPay + period.netPay,
      }),
      { grossPay: 0, federalTax: 0, socialSecurity: 0, medicare: 0, netPay: 0 }
    )
  }, [paystubData.payPeriods, selectedPayPeriod, selectedPeriod])

  const handleExportCsv = () => {
    if (!paystubData.payPeriods.length) {
      return
    }

    const csv = payPeriodsToCsv(paystubData.payPeriods)

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'pay-periods.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="section-spacing container-narrow" role="main">
      <div aria-live="polite" className="sr-only">
        {isGenerating ? 'Generating payroll records' : resultsVisible ? 'Payroll results ready' : 'Paystub form ready'}
      </div>
      <header className="text-center space-y-tight mb-heading">
        <p className="text-sm font-semibold text-muted-foreground">Payroll Toolkit</p>
        <h1 className="text-4xl font-bold text-foreground">Paystub Generator</h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Enter your payroll details, validate inputs, and generate professional pay stubs with printable pay period and W-2 style annual summaries.
        </p>
        {hasFormData && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="mt-2"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Calculator
          </Button>
        )}
      </header>

      {documentType === 'form' && (
        <section className="space-y-8">
          <PaystubForm
            paystubData={paystubData}
            setPaystubData={setPaystubData}
            selectedState={selectedState}
            setSelectedState={setSelectedState}
            payFrequency={payFrequency}
            setPayFrequency={setPayFrequency}
            overtimeHours={overtimeHours}
            setOvertimeHours={setOvertimeHours}
            overtimeRate={overtimeRate}
            setOvertimeRate={setOvertimeRate}
            additionalDeductions={additionalDeductions}
            setAdditionalDeductions={setAdditionalDeductions}
            formErrors={formErrors}
            onGenerate={generatePaystubs}
            onClear={handleClearForm}
            isGenerating={isGenerating}
          />

          {resultsVisible && paystubData.payPeriods.length > 0 && (
            <ResultsPanel
              paystubData={paystubData}
              payFrequency={payFrequency}
              selectedPeriod={selectedPeriod}
              setSelectedPeriod={setSelectedPeriod}
              setDocumentType={setDocumentType}
              onExportCsv={handleExportCsv}
              showTable={showTable}
              setShowTable={setShowTable}
            />
          )}
        </section>
      )}

      {documentType === 'paystub' && resultsVisible && selectedPayPeriod && ytdTotals && (
        <section className="space-y-6">
      <PaystubNavigation
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        documentType={documentType}
        setDocumentType={setDocumentType}
            onBackToForm={backToForm}
            onPrint={handlePrint}
            payPeriods={paystubData.payPeriods}
          />

          <PayStub
            payPeriod={selectedPayPeriod}
            employeeData={paystubData}
            ytdTotals={ytdTotals}
          />
        </section>
      )}

      {documentType === 'annual' && resultsVisible && (
        <section className="space-y-6">
          <PaystubNavigation
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            documentType={documentType}
            setDocumentType={setDocumentType}
            onBackToForm={backToForm}
            onPrint={handlePrint}
            payPeriods={paystubData.payPeriods}
          />

          <AnnualWageSummary employeeData={paystubData} />
        </section>
      )}
    </main>
  )
}

interface ResultsPanelProps {
  paystubData: PaystubData
  payFrequency: PayFrequency
  selectedPeriod: number
  setSelectedPeriod: (period: number) => void
  setDocumentType: (type: 'form' | 'paystub' | 'annual') => void
  onExportCsv: () => void
  showTable: boolean
  setShowTable: (open: boolean) => void
}

function ResultsPanel({ paystubData, payFrequency, selectedPeriod, setSelectedPeriod, setDocumentType, onExportCsv, showTable, setShowTable }: ResultsPanelProps) {
  const periods = paystubData.payPeriods
  const periodCount = periods.length || PAY_PERIODS_BY_FREQUENCY[payFrequency]

  return (
    <section id="results" className="space-y-6">
      <header className="flex-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Results</p>
          <h2 className="text-2xl font-bold text-foreground">Payroll summary</h2>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setDocumentType('paystub')} disabled={periods.length === 0}>
            View pay stub
          </Button>
          <Button variant="outline" onClick={() => setDocumentType('annual')} disabled={periods.length === 0}>
            View annual summary
          </Button>
          <Button variant="secondary" onClick={onExportCsv} disabled={periods.length === 0}>
            Download CSV
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Total gross" value={formatCurrency(paystubData.totals.grossPay)} />
        <SummaryCard
          label="Total taxes & deductions"
          value={formatCurrency(
            paystubData.totals.federalTax +
              paystubData.totals.socialSecurity +
              paystubData.totals.medicare +
              paystubData.totals.stateTax +
              paystubData.totals.otherDeductions,
          )}
        />
        <SummaryCard label="Net pay" value={formatCurrency(paystubData.totals.netPay)} />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex-between p-4 border-b border-border">
          <div>
            <p className="text-sm text-muted-foreground">{payFrequency.toUpperCase()} · {periodCount} periods/year</p>
            <h3 className="text-lg font-semibold">Pay periods</h3>
          </div>
          {periods.length > 0 && (
            <div className="flex items-center gap-2">
              <Label htmlFor="periodSelect">Period</Label>
              <Select
                value={selectedPeriod.toString()}
                onValueChange={(value) => setSelectedPeriod(parseInt(value))}
              >
                <SelectTrigger id="periodSelect" className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.period} value={period.period.toString()}>
                      Period {period.period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setShowTable(!showTable)}>
                {showTable ? 'Hide table' : 'Show table'}
              </Button>
            </div>
          )}
        </div>
        {showTable && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Generated pay periods table">
              <caption className="sr-only">Pay periods for selected payroll run</caption>
              <thead className="bg-muted text-left">
                <tr>
                  <Th>Period</Th>
                  <Th>Pay date</Th>
                  <Th className="text-right">Hours</Th>
                  <Th className="text-right">Gross</Th>
                  <Th className="text-right">Fed tax</Th>
                  <Th className="text-right">SS</Th>
                  <Th className="text-right">Medicare</Th>
                  <Th className="text-right">State</Th>
                  <Th className="text-right">Other</Th>
                  <Th className="text-right">Net</Th>
                </tr>
              </thead>
              <tbody>
                {periods.map((period, index) => (
                  <tr key={period.period} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/60'}>
                    <Td>{period.period}</Td>
                    <Td>{formatDate(period.payDate)}</Td>
                    <Td className="text-right">{period.hours}</Td>
                    <Td className="text-right">{formatCurrency(period.grossPay)}</Td>
                    <Td className="text-right">{formatCurrency(period.federalTax)}</Td>
                    <Td className="text-right">{formatCurrency(period.socialSecurity)}</Td>
                    <Td className="text-right">{formatCurrency(period.medicare)}</Td>
                    <Td className="text-right">{formatCurrency(period.stateTax)}</Td>
                    <Td className="text-right">{formatCurrency(period.otherDeductions)}</Td>
                    <Td className="text-right font-semibold">{formatCurrency(period.netPay)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

interface SummaryCardProps {
  label: string
  value: string
}

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-xs">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2 font-semibold text-foreground ${className ?? ''}`}>{children}</th>
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 border-t border-border ${className ?? ''}`}>{children}</td>
}
