import React from 'react'
import { formatCurrency } from '@/lib/utils'

interface PayStubDeductionsProps {
  federalTax: number
  socialSecurity: number
  medicare: number
  ytdFederalTax: number
  ytdSocialSecurity: number
  ytdMedicare: number
}

export const PayStubDeductions: React.FC<PayStubDeductionsProps> = ({
  federalTax,
  socialSecurity,
  medicare,
  ytdFederalTax,
  ytdSocialSecurity,
  ytdMedicare
}) => {
  const totalDeductions = federalTax + socialSecurity + medicare

  return (
    <div className="mb-5">
      <h3 className="m-0 mb-subheading.5 text-sm border-b border-black pb-1.5">DEDUCTIONS</h3>
      <div className="grid grid-cols-[(1fr_auto_auto)] gap-tight.5 items-center">
        <div><strong>Description</strong></div>
        <div className="text-right"><strong>Current</strong></div>
        <div className="text-right"><strong>YTD</strong></div>

        <div className="border-t border-border pt-1.5">Federal Income Tax</div>
        <div className="border-t border-border pt-1.5 text-right">
          {formatCurrency(federalTax)}
        </div>
        <div className="border-t border-border pt-1.5 text-right">
          {formatCurrency(ytdFederalTax)}
        </div>

        <div>Social Security Tax</div>
        <div className="text-right">{formatCurrency(socialSecurity)}</div>
        <div className="text-right">{formatCurrency(ytdSocialSecurity)}</div>

        <div>Medicare Tax</div>
        <div className="text-right">{formatCurrency(medicare)}</div>
        <div className="text-right">{formatCurrency(ytdMedicare)}</div>
      </div>
      <div className="border-t-2 border-black mt-2.5 pt-1.5 flex-between font-bold">
        <span>TOTAL CURRENT DEDUCTIONS:</span>
        <span>{formatCurrency(totalDeductions)}</span>
      </div>
    </div>
  )
}