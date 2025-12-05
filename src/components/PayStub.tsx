import React from 'react'
import { FileText } from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import type { PayPeriod, PaystubData } from '@/types/paystub'

interface PayStubProps {
  payPeriod: PayPeriod
  employeeData: PaystubData
  ytdTotals: {
    grossPay: number
    federalTax: number
    socialSecurity: number
    medicare: number
    netPay: number
  }
}

export const PayStub: React.FC<PayStubProps> = ({ payPeriod, employeeData, ytdTotals }) => {
  const handleSaveAsPDF = () => {
    window.print()
  }

  return (
    <div className="relative">
      {/* Save as PDF Button */}
      <div className="no-print absolute -top-[var(--spacing-16)] right-0 z-[1000]">
        <button
          onClick={handleSaveAsPDF}
          className={cn(
            "flex items-center gap-tight px-6 py-3 rounded-md text-sm font-semibold transition-smooth",
            "bg-accent text-primary-foreground border-0 shadow-xs cursor-pointer",
            "hover:bg-accent/90 focus-ring"
          )}
        >
          <FileText className="w-4 h-4" />
          Save as PDF
        </button>
      </div>

      <div className={cn(
        "max-w-[8.5in] min-h-[11in] mx-auto bg-card p-[1in]",
        "font-sans text-[var(--spacing-3)] text-black border border-border"
      )}>
        {/* Header */}
        <div className="border-b-2 border-black pb-5 mb-5">
          <div className="flex-between items-start">
            <div>
              <h2 className="text-lg font-bold m-0 mb-subheading.5">EARNINGS STATEMENT</h2>
              <div>
                <strong>{employeeData.employerName || '[EMPLOYER NAME]'}</strong><br/>
                <span className="text-[var(--spacing-3)] text-muted-foreground">
                  Pay Period: {formatDate(payPeriod.payDate)} - {formatDate(payPeriod.payDate)}<br/>
                  Pay Date: {formatDate(payPeriod.payDate)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="border border-black p-2.5 bg-muted">
                <strong>CHECK #{payPeriod.period.toString().padStart(4, '0')}</strong><br/>
                <span className="text-base font-bold">
                  {formatCurrency(payPeriod.netPay)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Information */}
        <div className="flex-between mb-5">
          <div>
            <h3 className="m-0 mb-subheading.5 text-sm">EMPLOYEE</h3>
            <div>
              <strong>{employeeData.employeeName}</strong><br/>
              {employeeData.employeeId && <span>ID: {employeeData.employeeId}<br/></span>}
            </div>
          </div>
          <div className="text-right">
            <h3 className="m-0 mb-subheading.5 text-sm">PAY PERIOD</h3>
            <div>
              Period {payPeriod.period} of 26<br/>
              Tax Year: {employeeData.taxYear}
            </div>
          </div>
        </div>

        {/* Earnings Section */}
        <div className="mb-5">
          <h3 className="m-0 mb-subheading.5 text-sm border-b border-black pb-1.5">EARNINGS</h3>
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-tight.5 items-center">
            <div><strong>Description</strong></div>
            <div className="text-right"><strong>Rate</strong></div>
            <div className="text-right"><strong>Hours</strong></div>
            <div className="text-right"><strong>Current</strong></div>

            <div className="border-t border-border pt-1.5">Regular</div>
            <div className="border-t border-border pt-1.5 text-right">
              {formatCurrency(employeeData.hourlyRate)}
            </div>
            <div className="border-t border-border pt-1.5 text-right">
              {payPeriod.hours}
            </div>
            <div className="border-t border-border pt-1.5 text-right">
              {formatCurrency(payPeriod.grossPay)}
            </div>
          </div>
          <div className="border-t-2 border-black mt-2.5 pt-1.5 flex-between font-bold">
            <span>TOTAL CURRENT EARNINGS:</span>
            <span>{formatCurrency(payPeriod.grossPay)}</span>
          </div>
        </div>

        {/* Deductions Section */}
        <div className="mb-5">
          <h3 className="m-0 mb-subheading.5 text-sm border-b border-black pb-1.5">DEDUCTIONS</h3>
          <div className="grid grid-cols-[1fr_auto_auto] gap-tight.5 items-center">
            <div><strong>Description</strong></div>
            <div className="text-right"><strong>Current</strong></div>
            <div className="text-right"><strong>YTD</strong></div>

            <div className="border-t border-border pt-1.5">Federal Income Tax</div>
            <div className="border-t border-border pt-1.5 text-right">
              {formatCurrency(payPeriod.federalTax)}
            </div>
            <div className="border-t border-border pt-1.5 text-right">
              {formatCurrency(ytdTotals.federalTax)}
            </div>

            <div>Social Security Tax</div>
            <div className="text-right">{formatCurrency(payPeriod.socialSecurity)}</div>
            <div className="text-right">{formatCurrency(ytdTotals.socialSecurity)}</div>

            <div>Medicare Tax</div>
            <div className="text-right">{formatCurrency(payPeriod.medicare)}</div>
            <div className="text-right">{formatCurrency(ytdTotals.medicare)}</div>
          </div>
          <div className="border-t-2 border-black mt-2.5 pt-1.5 flex-between font-bold">
            <span>TOTAL CURRENT DEDUCTIONS:</span>
            <span>{formatCurrency(payPeriod.federalTax + payPeriod.socialSecurity + payPeriod.medicare)}</span>
          </div>
        </div>

        {/* Net Pay Summary */}
        <div className="border-2 border-black card-padding-sm bg-muted mb-5">
          <div className="flex-between items-center text-base font-bold">
            <span>NET PAY:</span>
            <span>{formatCurrency(payPeriod.netPay)}</span>
          </div>
        </div>

        {/* Year-to-Date Summary */}
        <div className="border-t border-black pt-4">
          <h3 className="m-0 mb-subheading.5 text-sm">YEAR-TO-DATE TOTALS</h3>
          <div className="grid grid-cols-[1fr_auto] gap-tight.5 text-[11px]">
            <div>Gross Earnings:</div>
            <div className="text-right">{formatCurrency(ytdTotals.grossPay)}</div>
            <div>Federal Income Tax:</div>
            <div className="text-right">{formatCurrency(ytdTotals.federalTax)}</div>
            <div>Social Security Tax:</div>
            <div className="text-right">{formatCurrency(ytdTotals.socialSecurity)}</div>
            <div>Medicare Tax:</div>
            <div className="text-right">{formatCurrency(ytdTotals.medicare)}</div>
            <div className="border-t border-black pt-1.5 font-bold">Net Pay:</div>
            <div className="border-t border-black pt-1.5 text-right font-bold">
              {formatCurrency(ytdTotals.netPay)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-heading text-[var(--spacing-3)] text-muted-foreground border-t border-border pt-2.5">
          <div className="text-center">
            This statement is for informational purposes only and does not constitute an official document.
            <br/>
            Please retain this statement for your records.
          </div>
        </div>
      </div>
    </div>
  )
}
