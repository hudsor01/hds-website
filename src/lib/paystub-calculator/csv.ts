import type { PayPeriod } from '@/types/paystub'
import { formatDate } from '@/lib/utils'

export function payPeriodsToCsv(payPeriods: PayPeriod[]): string {
  const headers = [
    'Period',
    'Pay Date',
    'Hours',
    'Gross Pay',
    'Federal Tax',
    'Social Security',
    'Medicare',
    'State Tax',
    'Other Deductions',
    'Net Pay',
  ]

  const rows = payPeriods.map((p) => [
    p.period,
    formatDate(p.payDate),
    p.hours,
    p.grossPay,
    p.federalTax,
    p.socialSecurity,
    p.medicare,
    p.stateTax,
    p.otherDeductions,
    p.netPay,
  ])

  return [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => serializeCell(cell)).join(',')),
  ].join('\n')
}

function serializeCell(cell: string | number): string | number {
  if (typeof cell === 'string') {
    return `"${cell.replace(/"/g, '""')}"`
  }
  return cell
}

