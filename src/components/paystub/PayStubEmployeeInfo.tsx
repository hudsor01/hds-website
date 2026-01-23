'use client';

import React from 'react'

interface PayStubEmployeeInfoProps {
  employeeName: string
  employeeId?: string
  period: number
  totalPeriods: number
  taxYear: number
}

export const PayStubEmployeeInfo: React.FC<PayStubEmployeeInfoProps> = ({
  employeeName,
  employeeId,
  period,
  totalPeriods,
  taxYear
}) => {
  return (
    <div className="flex-between mb-5">
      <div>
        <h3 className="m-0 mb-subheading.5 text-sm">EMPLOYEE</h3>
        <div>
          <strong>{employeeName}</strong><br/>
          {employeeId && <span>ID: {employeeId}<br/></span>}
        </div>
      </div>
      <div className="text-right">
        <h3 className="m-0 mb-subheading.5 text-sm">PAY PERIOD</h3>
        <div>
          Period {period} of {totalPeriods}<br/>
          Tax Year: {taxYear}
        </div>
      </div>
    </div>
  )
}
