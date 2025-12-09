import React from 'react'
import { formatCurrency, cn } from '@/lib/utils'

interface PayStubNetPayProps {
  netPay: number
}

export const PayStubNetPay: React.FC<PayStubNetPayProps> = ({ netPay }) => {
  return (
    <div className={cn(
      "border-2 border-black card-padding-sm bg-muted mb-5"
    )}>
      <div className="flex-between items-center text-base font-bold">
        <span>NET PAY:</span>
        <span>{formatCurrency(netPay)}</span>
      </div>
    </div>
  )
}