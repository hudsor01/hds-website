import { formatDate } from '@/lib/utils'
import type { PayPeriod } from '@/types/paystub'

export function payPeriodsToCsv(payPeriods: PayPeriod[]): string {
	const headers = [
		'Period',
		'Pay Date',
		'Hours',
		'Gross Pay',
		'Pre-Tax Deductions',
		'Federal Tax',
		'Social Security',
		'Medicare',
		'State Tax',
		'State Insurance',
		'After-Tax Deductions',
		'Net Pay'
	]

	const rows = payPeriods.map(p => [
		p.period,
		formatDate(p.payDate),
		p.hours,
		p.grossPay,
		p.preTaxDeductions,
		p.federalTax,
		p.socialSecurity,
		p.medicare,
		p.stateTax,
		p.stateInsurance,
		p.otherDeductions,
		p.netPay
	])

	return [
		headers.join(','),
		...rows.map(row => row.map(cell => serializeCell(cell)).join(','))
	].join('\n')
}

function serializeCell(cell: string | number): string | number {
	if (typeof cell === 'string') {
		return `"${cell.replace(/"/g, '""')}"`
	}
	return cell
}
