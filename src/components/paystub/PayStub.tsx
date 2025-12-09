import React from 'react'
import { cn } from '@/lib/utils'
import type { PayPeriod, PaystubData } from '@/types/paystub'
import { PayStubHeader } from './PayStubHeader'
import { PayStubEmployeeInfo } from './PayStubEmployeeInfo'
import { PayStubEarnings } from './PayStubEarnings'
import { PayStubDeductions } from './PayStubDeductions'
import { PayStubNetPay } from './PayStubNetPay'
import { PayStubYearToDate } from './PayStubYearToDate'
import { PayStubFooter } from './PayStubFooter'
import { PayStubSaveButton } from './PayStubSaveButton'
import { PaystubPDF } from '@/lib/pdf/paystub-template'
import { downloadPDF } from '@/lib/pdf/client-pdf'
import { logger } from '@/lib/logger'

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
  const handleSaveAsPDF = async () => {
    try {
      const filename = `paystub-${employeeData.employeeName || 'employee'}-${payPeriod.payDate}.pdf`;
      await downloadPDF(
        <PaystubPDF
          payPeriod={payPeriod}
          employeeData={employeeData}
          ytdTotals={ytdTotals}
        />,
        filename
      );
    } catch (error) {
      logger.error('Failed to generate PDF:', error);
      // Fallback to print
      window.print();
    }
  }

  return (
    <div className="relative" aria-label={`Pay stub for ${employeeData.employeeName || 'employee'}`} role="article">
      <PayStubSaveButton onSave={handleSaveAsPDF} />

      <div className={cn(
        "max-w-[8.5in] min-h-[11in] mx-auto bg-card p-24",
        "font-sans text-black border border-border"
      )}>
        <PayStubHeader
          employerName={employeeData.employerName}
          payDate={payPeriod.payDate}
          checkNumber={payPeriod.period.toString().padStart(4, '0')}
          netPay={payPeriod.netPay}
        />

        <PayStubEmployeeInfo
          employeeName={employeeData.employeeName}
          employeeId={employeeData.employeeId}
          period={payPeriod.period}
          totalPeriods={26} // Assuming bi-weekly
          taxYear={employeeData.taxYear}
        />

        <section aria-label="Earnings" role="region">
          <PayStubEarnings
            hourlyRate={employeeData.hourlyRate}
            hours={payPeriod.hours}
            grossPay={payPeriod.grossPay}
          />
        </section>

        <section aria-label="Deductions" role="region">
          <PayStubDeductions
            federalTax={payPeriod.federalTax}
            socialSecurity={payPeriod.socialSecurity}
            medicare={payPeriod.medicare}
            ytdFederalTax={ytdTotals.federalTax}
            ytdSocialSecurity={ytdTotals.socialSecurity}
            ytdMedicare={ytdTotals.medicare}
          />
        </section>

        <PayStubNetPay netPay={payPeriod.netPay} />

        <PayStubYearToDate
          grossPay={ytdTotals.grossPay}
          federalTax={ytdTotals.federalTax}
          socialSecurity={ytdTotals.socialSecurity}
          medicare={ytdTotals.medicare}
          netPay={ytdTotals.netPay}
        />

        <PayStubFooter />
      </div>
    </div>
  )
}
