import React from 'react'
import { FileText } from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import type { PaystubData } from '@/types/paystub'
import { getCurrentTaxData } from '@/lib/paystub-utils'

interface AnnualWageSummaryProps {
  employeeData: PaystubData
}

export const AnnualWageSummary: React.FC<AnnualWageSummaryProps> = ({ employeeData }) => {
  const handleSaveAsPDF = () => {
    window.print()
  }

  // Add a safe lookup for the Social Security wage base to avoid possible undefined access
  const ssWageBase = getCurrentTaxData()?.ssWageBase ?? employeeData.totals.grossPay
  const socialSecurityWages = Math.min(employeeData.totals.grossPay, ssWageBase)

  return (
    <div className="relative">
      {/* Save as PDF Button */}
      <div className="no-print absolute -top-[60px] right-0 z-[1000]">
        <button
          onClick={handleSaveAsPDF}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-md text-sm font-semibold transition-smooth",
            "bg-accent text-white border-0 shadow-sm cursor-pointer",
            "hover:bg-accent/90 focus-ring"
          )}
        >
          <FileText className="w-4 h-4" />
          Save as PDF
        </button>
      </div>

      <div className={cn(
        "max-w-[8.5in] min-h-[11in] mx-auto bg-white p-[0.75in]",
        "font-serif text-[11px] text-black leading-relaxed"
      )}>
      {/* Official Header */}
      <div className="text-center border-b-2 border-black pb-[15px] mb-[25px] relative">
        <div className="text-[10px] text-gray-600 mb-2 tracking-wide">
          UNITED STATES DEPARTMENT OF LABOR
        </div>
        <h1 className="text-xl font-bold m-0 mb-2 tracking-widest uppercase">
          ANNUAL WAGE AND TAX STATEMENT
        </h1>
        <div className="text-sm m-0 mb-2.5 font-semibold">
          Tax Year {employeeData.taxYear}
        </div>
        {employeeData.employerName && (
          <div className="text-xs font-semibold mt-2.5 p-1.5 border border-gray-300 inline-block bg-gray-50">
            EMPLOYER: {employeeData.employerName.toUpperCase()}
          </div>
        )}
        <div className="absolute top-0 right-0 text-[8px] text-gray-400 font-sans">
          Form W-2 Summary
        </div>
      </div>

      {/* Employee Information */}
      <div className="border-2 border-black mb-5 bg-white">
        <div className="bg-black text-white px-[15px] py-2 text-xs font-bold tracking-wider">
          EMPLOYEE INFORMATION
        </div>
        <div className="p-[15px] grid grid-cols-2 gap-5">
          <div>
            <div className="mb-2">
              <span className="font-bold text-[10px] text-gray-600">EMPLOYEE NAME:</span><br/>
              <span className="text-xs font-semibold">{employeeData.employeeName.toUpperCase()}</span>
            </div>
            {employeeData.employeeId && (
              <div className="mb-2">
                <span className="font-bold text-[10px] text-gray-600">EMPLOYEE ID/SSN:</span><br/>
                <span className="text-xs font-semibold">{employeeData.employeeId}</span>
              </div>
            )}
          </div>
          <div>
            <div className="mb-2">
              <span className="font-bold text-[10px] text-gray-600">PAY FREQUENCY:</span><br/>
              <span className="text-xs">Bi-weekly (26 pay periods)</span>
            </div>
            <div className="mb-2">
              <span className="font-bold text-[10px] text-gray-600">FILING STATUS:</span><br/>
              <span className="text-xs">{
                employeeData.filingStatus === 'single' ? 'Single' :
                employeeData.filingStatus === 'marriedJoint' ? 'Married filing jointly' :
                employeeData.filingStatus === 'marriedSeparate' ? 'Married filing separately' :
                employeeData.filingStatus === 'headOfHousehold' ? 'Head of household' :
                employeeData.filingStatus === 'qualifyingSurvivingSpouse' ? 'Qualifying surviving spouse' :
                employeeData.filingStatus
              }</span>
            </div>
          </div>
        </div>
      </div>

      {/* Annual Totals */}
      <div className="border-2 border-black mb-5 bg-white">
        <div className="bg-black text-white px-[15px] py-2 text-xs font-bold tracking-wider text-center">
          ANNUAL COMPENSATION SUMMARY - {employeeData.taxYear}
        </div>

        <div className="grid grid-cols-3 border-b border-black">
          {/* Earnings */}
          <div className="border-r border-black p-[15px]">
            <div className="text-[11px] font-bold mb-2.5 text-center border-b border-gray-300 pb-1.5">
              GROSS EARNINGS
            </div>
            <div className="text-[10px]">
              <div className="flex-between py-[3px] border-b border-dotted border-gray-300">
                <span>Total Hours:</span>
                <span className="font-semibold">{employeeData.totals.hours}</span>
              </div>
              <div className="flex-between py-[3px] border-b border-dotted border-gray-300">
                <span>Regular Wages:</span>
                <span className="font-semibold">{formatCurrency(employeeData.totals.grossPay)}</span>
              </div>
              <div className="flex-between py-2 border-t border-black font-bold text-[11px] bg-gray-50">
                <span>TOTAL GROSS:</span>
                <span>{formatCurrency(employeeData.totals.grossPay)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="border-r border-black p-[15px]">
            <div className="text-[11px] font-bold mb-2.5 text-center border-b border-gray-300 pb-1.5">
              TAX DEDUCTIONS
            </div>
            <div className="text-[10px]">
              <div className="flex-between py-[3px] border-b border-dotted border-gray-300">
                <span>Federal Income Tax:</span>
                <span className="font-semibold">{formatCurrency(employeeData.totals.federalTax)}</span>
              </div>
              <div className="flex-between py-[3px] border-b border-dotted border-gray-300">
                <span>Social Security (6.2%):</span>
                <span className="font-semibold">{formatCurrency(employeeData.totals.socialSecurity)}</span>
              </div>
              <div className="flex-between py-[3px] border-b border-dotted border-gray-300">
                <span>Medicare (1.45%):</span>
                <span className="font-semibold">{formatCurrency(employeeData.totals.medicare)}</span>
              </div>
              <div className="flex-between py-2 border-t border-black font-bold text-[11px] bg-gray-50">
                <span>TOTAL TAXES:</span>
                <span>{formatCurrency(employeeData.totals.federalTax + employeeData.totals.socialSecurity + employeeData.totals.medicare)}</span>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="p-[15px] flex flex-col justify-center items-center bg-gray-50">
            <div className="text-[11px] font-bold mb-2.5 text-center border-b border-gray-300 pb-1.5 w-full">
              NET ANNUAL PAY
            </div>
            <div className="text-base font-bold text-center p-2.5 border-2 border-black bg-white rounded-sm">
              {formatCurrency(employeeData.totals.netPay)}
            </div>
            <div className="text-[8px] text-gray-600 mt-1.5 text-center">
              After all deductions
            </div>
          </div>
        </div>
      </div>

      {/* W-2 Information */}
      <div className="border-2 border-black p-5 mb-[30px] bg-[#fff8dc]">
        <h3 className="m-0 mb-5 text-base text-center border-b border-black pb-2.5">
          W-2 TAX DOCUMENT INFORMATION
        </h3>

        <div className="grid grid-cols-2 gap-[15px] text-[11px]">
          <div className="border border-gray-300 p-2.5 bg-white">
            <strong>Box 1 - Wages, tips, other compensation:</strong><br/>
            {formatCurrency(employeeData.totals.grossPay)}
          </div>

          <div className="border border-gray-300 p-2.5 bg-white">
            <strong>Box 2 - Federal income tax withheld:</strong><br/>
            {formatCurrency(employeeData.totals.federalTax)}
          </div>

          <div className="border border-gray-300 p-2.5 bg-white">
            <strong>Box 3 - Social security wages:</strong><br/>
            {formatCurrency(socialSecurityWages)}
          </div>

          <div className="border border-gray-300 p-2.5 bg-white">
            <strong>Box 4 - Social security tax withheld:</strong><br/>
            {formatCurrency(employeeData.totals.socialSecurity)}
          </div>

          <div className="border border-gray-300 p-2.5 bg-white">
            <strong>Box 5 - Medicare wages and tips:</strong><br/>
            {formatCurrency(employeeData.totals.grossPay)}
          </div>

          <div className="border border-gray-300 p-2.5 bg-white">
            <strong>Box 6 - Medicare tax withheld:</strong><br/>
            {formatCurrency(employeeData.totals.medicare)}
          </div>
        </div>
      </div>

      {/* Pay Periods Summary Table */}
      <div className="mb-[30px]">
        <h3 className="m-0 mb-[15px] text-base border-b border-black pb-2.5">
          PAY PERIODS SUMMARY
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[10px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-center">Period</th>
                <th className="border border-black p-2 text-center">Pay Date</th>
                <th className="border border-black p-2 text-center">Hours</th>
                <th className="border border-black p-2 text-center">Gross Pay</th>
                <th className="border border-black p-2 text-center">Fed Tax</th>
                <th className="border border-black p-2 text-center">SS Tax</th>
                <th className="border border-black p-2 text-center">Med Tax</th>
                <th className="border border-black p-2 text-center">Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {employeeData.payPeriods.map((period) => (
                <tr key={period.period}>
                  <td className="border border-gray-300 p-1.5 text-center">{period.period}</td>
                  <td className="border border-gray-300 p-1.5 text-center">{formatDate(period.payDate)}</td>
                  <td className="border border-gray-300 p-1.5 text-center">{period.hours}</td>
                  <td className="border border-gray-300 p-1.5 text-right">{formatCurrency(period.grossPay)}</td>
                  <td className="border border-gray-300 p-1.5 text-right">{formatCurrency(period.federalTax)}</td>
                  <td className="border border-gray-300 p-1.5 text-right">{formatCurrency(period.socialSecurity)}</td>
                  <td className="border border-gray-300 p-1.5 text-right">{formatCurrency(period.medicare)}</td>
                  <td className="border border-gray-300 p-1.5 text-right">{formatCurrency(period.netPay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Footer */}
      <div className="mt-[25px] p-[15px] border border-black bg-gray-100 text-[9px] text-gray-800">
        <div className="text-center font-bold text-[10px] mb-2.5 tracking-wide">
          OFFICIAL ANNUAL WAGE AND TAX STATEMENT
        </div>
        <div className="grid grid-cols-2 gap-5 mb-2.5">
          <div>
            <strong>EMPLOYER CERTIFICATION:</strong><br/>
            This document certifies that the above information accurately reflects all compensation paid and taxes withheld for the employee during the specified tax year in compliance with federal tax regulations.
          </div>
          <div>
            <strong>EMPLOYEE NOTICE:</strong><br/>
            Retain this document for tax filing purposes. This statement contains information required for completing your federal income tax return and should be kept with your permanent tax records.
          </div>
        </div>
        <div className="text-center border-t border-gray-300 pt-2.5 text-[8px] text-gray-600">
          <div>
            <strong>Document Generated:</strong> {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} | <strong>Reference:</strong> AWS-{employeeData.taxYear}-{Math.random().toString(36).substr(2, 9).toUpperCase()}
          </div>
          <div className="mt-1.5">
            This is an electronically generated document. No signature required for official use.
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
