import React from 'react'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface PayStubNetPayProps {
  netPay: number
}

export const PayStubNetPay: React.FC<PayStubNetPayProps> = ({ netPay }) => {
  return (
    <Card size="sm" className="border-2 border-black bg-muted mb-5">
      <div className="flex-between items-center text-base font-bold">
        <span>NET PAY:</span>
        <span>{formatCurrency(netPay)}</span>
      </div>
    </Card>
  )
}