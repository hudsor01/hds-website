import React from 'react'
import { formatCurrency } from '@/lib/utils'

interface PayStubYearToDateProps {
  grossPay: number
  federalTax: number
  socialSecurity: number
  medicare: number
  netPay: number
}

export const PayStubYearToDate: React.FC<PayStubYearToDateProps> = ({
  grossPay,
  federalTax,
  socialSecurity,
  medicare,
  netPay
}) => {
  return (
    <div className="border-t border-black pt-4">
      <h3 className="m-0 mb-subheading.5 text-sm">YEAR-TO-DATE TOTALS</h3>
      <div className="grid grid-cols-[1fr_auto] gap-tight.5 text-[11px]">
        <div>Gross Earnings:</div>
        <div className="text-right">{formatCurrency(grossPay)}</div>
        <div>Federal Income Tax:</div>
        <div className="text-right">{formatCurrency(federalTax)}</div>
        <div>Social Security Tax:</div>
        <div className="text-right">{formatCurrency(socialSecurity)}</div>
        <div>Medicare Tax:</div>
        <div className="text-right">{formatCurrency(medicare)}</div>
        <div className="border-t border-black pt-1.5 font-bold">Net Pay:</div>
        <div className="border-t border-black pt-1.5 text-right font-bold">
          {formatCurrency(netPay)}
        </div>
      </div>
    </div>
  )
}