import React from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface PayStubHeaderProps {
  employerName: string
  payDate: string
  checkNumber: string
  netPay: number
}

export const PayStubHeader: React.FC<PayStubHeaderProps> = ({
  employerName,
  payDate,
  checkNumber,
  netPay
}) => {
  const payDateObj = new Date(payDate)
  return (
    <div className="border-b-2 border-black pb-5 mb-5">
      <div className="flex-between items-start">
        <div>
          <h2 className="text-lg font-bold m-0 mb-5">EARNINGS STATEMENT</h2>
          <div>
            <strong>{employerName || '[EMPLOYER NAME]'}</strong><br/>
            <span className="text-muted-foreground">
              Pay Period: {formatDate(payDateObj)} - {formatDate(payDateObj)}<br/>
              Pay Date: {formatDate(payDateObj)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="border border-black p-2.5 bg-muted">
            <strong>CHECK #{checkNumber}</strong><br/>
            <span className="text-base font-bold">
              {formatCurrency(netPay)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
