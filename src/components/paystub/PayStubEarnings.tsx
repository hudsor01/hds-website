'use client';

import React from 'react'
import { formatCurrency } from '@/lib/utils'

interface PayStubEarningsProps {
  hourlyRate: number
  hours: number
  grossPay: number
}

export const PayStubEarnings: React.FC<PayStubEarningsProps> = ({
  hourlyRate,
  hours,
  grossPay
}) => {
  return (
    <div className="mb-5">
      <h3 className="m-0 mb-subheading.5 text-sm border-b border-black pb-1.5">EARNINGS</h3>
      <div className="grid grid-cols-[(1fr_auto_auto_auto)] gap-tight.5 items-center">
        <div><strong>Description</strong></div>
        <div className="text-right"><strong>Rate</strong></div>
        <div className="text-right"><strong>Hours</strong></div>
        <div className="text-right"><strong>Current</strong></div>

        <div className="border-t border-border pt-1.5">Regular</div>
        <div className="border-t border-border pt-1.5 text-right">
          {formatCurrency(hourlyRate)}
        </div>
        <div className="border-t border-border pt-1.5 text-right">
          {hours}
        </div>
        <div className="border-t border-border pt-1.5 text-right">
          {formatCurrency(grossPay)}
        </div>
      </div>
      <div className="border-t-2 border-black mt-2.5 pt-1.5 flex-between font-bold">
        <span>TOTAL CURRENT EARNINGS:</span>
        <span>{formatCurrency(grossPay)}</span>
      </div>
    </div>
  )
}