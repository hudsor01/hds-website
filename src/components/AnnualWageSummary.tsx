import { randomBytes } from 'crypto'
import { FileText } from 'lucide-react'
import React from 'react'
import { getCurrentTaxData } from '@/lib/paystub-calculator/paystub-utils'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PaystubData } from '@/types/paystub'

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

  const generateReferenceId = () => {
    return randomBytes(6).toString('hex').substring(0, 9).toUpperCase();
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Save as PDF Button */}
      <div className="no-print" style={{
        position: 'absolute',
        top: '-60px',
        right: '0',
        zIndex: 1000
      }}>
        <button
          onClick={handleSaveAsPDF}
          style={{
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#047857'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#059669'}
        >
          <FileText className="inline-block w-4 h-4 mr-2" />
          Save as PDF
        </button>
      </div>

      <div style={{
        maxWidth: '8.5in',
        minHeight: '11in',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '0.75in',
        fontFamily: 'Times, "Times New Roman", serif',
        fontSize: '11px',
        color: '#000',
        lineHeight: '1.4'
      }}>
      {/* Official Header */}
      <div style={{
        textAlign: 'center',
        borderBottom: '2px solid #000',
        paddingBottom: '15px',
        marginBottom: '25px',
        position: 'relative'
      }}>
        <div style={{
          fontSize: '10px',
          color: '#666',
          marginBottom: '8px',
          letterSpacing: '0.5px'
        }}>UNITED STATES DEPARTMENT OF LABOR</div>
        <h1 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          margin: '0 0 8px 0',
          letterSpacing: '1.5px',
          textTransform: 'uppercase'
        }}>ANNUAL WAGE AND TAX STATEMENT</h1>
        <div style={{
          fontSize: '14px',
          margin: '0 0 10px 0',
          fontWeight: '600'
        }}>Tax Year {employeeData.taxYear}</div>
        {employeeData.employerName && (
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            marginTop: '10px',
            padding: '5px',
            border: '1px solid #ccc',
            display: 'inline-block',
            backgroundColor: '#f9f9f9'
          }}>
            EMPLOYER: {employeeData.employerName.toUpperCase()}
          </div>
        )}
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          fontSize: '8px',
          color: '#999',
          fontFamily: 'Arial, sans-serif'
        }}>Form W-2 Summary</div>
      </div>

      {/* Employee Information */}
      <div style={{
        border: '2px solid #000',
        marginBottom: '20px',
        backgroundColor: 'white'
      }}>
        <div style={{
          backgroundColor: '#000',
          color: 'white',
          padding: '8px 15px',
          fontSize: '12px',
          fontWeight: 'bold',
          letterSpacing: '1px'
        }}>
          EMPLOYEE INFORMATION
        </div>
        <div style={{
          padding: '15px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}>
          <div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '10px', color: '#555' }}>EMPLOYEE NAME:</span><br/>
              <span style={{ fontSize: '12px', fontWeight: '600' }}>{employeeData.employeeName.toUpperCase()}</span>
            </div>
            {employeeData.employeeId && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '10px', color: '#555' }}>EMPLOYEE ID/SSN:</span><br/>
                <span style={{ fontSize: '12px', fontWeight: '600' }}>{employeeData.employeeId}</span>
              </div>
            )}
          </div>
          <div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '10px', color: '#555' }}>PAY FREQUENCY:</span><br/>
              <span style={{ fontSize: '12px' }}>Bi-weekly (26 pay periods)</span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '10px', color: '#555' }}>FILING STATUS:</span><br/>
              <span style={{ fontSize: '12px' }}>{
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
      <div style={{
        border: '2px solid #000',
        marginBottom: '20px',
        backgroundColor: 'white'
      }}>
        <div style={{
          backgroundColor: '#000',
          color: 'white',
          padding: '8px 15px',
          fontSize: '12px',
          fontWeight: 'bold',
          letterSpacing: '1px',
          textAlign: 'center'
        }}>
          ANNUAL COMPENSATION SUMMARY - {employeeData.taxYear}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          borderBottom: '1px solid #000'
        }}>
          {/* Earnings */}
          <div style={{
            borderRight: '1px solid #000',
            padding: '15px'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 'bold',
              marginBottom: '10px',
              textAlign: 'center',
              borderBottom: '1px solid #ccc',
              paddingBottom: '5px'
            }}>
              GROSS EARNINGS
            </div>
            <div style={{ fontSize: '10px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '3px 0',
                borderBottom: '1px dotted #ccc'
              }}>
                <span>Total Hours:</span>
                <span style={{ fontWeight: '600' }}>{employeeData.totals.hours}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '3px 0',
                borderBottom: '1px dotted #ccc'
              }}>
                <span>Regular Wages:</span>
                <span style={{ fontWeight: '600' }}>{formatCurrency(employeeData.totals.grossPay)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderTop: '1px solid #000',
                fontWeight: 'bold',
                fontSize: '11px',
                backgroundColor: '#f9f9f9'
              }}>
                <span>TOTAL GROSS:</span>
                <span>{formatCurrency(employeeData.totals.grossPay)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div style={{
            borderRight: '1px solid #000',
            padding: '15px'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 'bold',
              marginBottom: '10px',
              textAlign: 'center',
              borderBottom: '1px solid #ccc',
              paddingBottom: '5px'
            }}>
              TAX DEDUCTIONS
            </div>
            <div style={{ fontSize: '10px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '3px 0',
                borderBottom: '1px dotted #ccc'
              }}>
                <span>Federal Income Tax:</span>
                <span style={{ fontWeight: '600' }}>{formatCurrency(employeeData.totals.federalTax)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '3px 0',
                borderBottom: '1px dotted #ccc'
              }}>
                <span>Social Security (6.2%):</span>
                <span style={{ fontWeight: '600' }}>{formatCurrency(employeeData.totals.socialSecurity)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '3px 0',
                borderBottom: '1px dotted #ccc'
              }}>
                <span>Medicare (1.45%):</span>
                <span style={{ fontWeight: '600' }}>{formatCurrency(employeeData.totals.medicare)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderTop: '1px solid #000',
                fontWeight: 'bold',
                fontSize: '11px',
                backgroundColor: '#f9f9f9'
              }}>
                <span>TOTAL TAXES:</span>
                <span>{formatCurrency(employeeData.totals.federalTax + employeeData.totals.socialSecurity + employeeData.totals.medicare)}</span>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div style={{
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f8f8f8'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 'bold',
              marginBottom: '10px',
              textAlign: 'center',
              borderBottom: '1px solid #ccc',
              paddingBottom: '5px',
              width: '100%'
            }}>
              NET ANNUAL PAY
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              textAlign: 'center',
              padding: '10px',
              border: '2px solid #000',
              backgroundColor: 'white',
              borderRadius: '3px'
            }}>
              {formatCurrency(employeeData.totals.netPay)}
            </div>
            <div style={{
              fontSize: '8px',
              color: '#666',
              marginTop: '5px',
              textAlign: 'center'
            }}>
              After all deductions
            </div>
          </div>
        </div>
      </div>

      {/* W-2 Information */}
      <div style={{
        border: '2px solid #000',
        padding: '20px',
        marginBottom: '30px',
        backgroundColor: '#fff8dc'
      }}>
        <h3 style={{
          margin: '0 0 20px 0',
          fontSize: '16px',
          textAlign: 'center',
          borderBottom: '1px solid #000',
          paddingBottom: '10px'
        }}>W-2 TAX DOCUMENT INFORMATION</h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          fontSize: '11px'
        }}>
          <div style={{
            border: '1px solid #ccc',
            padding: '10px',
            backgroundColor: 'white'
          }}>
            <strong>Box 1 - Wages, tips, other compensation:</strong><br/>
            {formatCurrency(employeeData.totals.grossPay)}
          </div>

          <div style={{
            border: '1px solid #ccc',
            padding: '10px',
            backgroundColor: 'white'
          }}>
            <strong>Box 2 - Federal income tax withheld:</strong><br/>
            {formatCurrency(employeeData.totals.federalTax)}
          </div>

          <div style={{
            border: '1px solid #ccc',
            padding: '10px',
            backgroundColor: 'white'
          }}>
            <strong>Box 3 - Social security wages:</strong><br/>
            {formatCurrency(socialSecurityWages)}
          </div>

          <div style={{
            border: '1px solid #ccc',
            padding: '10px',
            backgroundColor: 'white'
          }}>
            <strong>Box 4 - Social security tax withheld:</strong><br/>
            {formatCurrency(employeeData.totals.socialSecurity)}
          </div>

          <div style={{
            border: '1px solid #ccc',
            padding: '10px',
            backgroundColor: 'white'
          }}>
            <strong>Box 5 - Medicare wages and tips:</strong><br/>
            {formatCurrency(employeeData.totals.grossPay)}
          </div>

          <div style={{
            border: '1px solid #ccc',
            padding: '10px',
            backgroundColor: 'white'
          }}>
            <strong>Box 6 - Medicare tax withheld:</strong><br/>
            {formatCurrency(employeeData.totals.medicare)}
          </div>
        </div>
      </div>

      {/* Pay Periods Summary Table */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{
          margin: '0 0 15px 0',
          fontSize: '16px',
          borderBottom: '1px solid #000',
          paddingBottom: '10px'
        }}>PAY PERIODS SUMMARY</h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '10px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Period</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Pay Date</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Hours</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Gross Pay</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Fed Tax</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>SS Tax</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Med Tax</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {employeeData.payPeriods.map((period) => (
                <tr key={period.period}>
                  <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{period.period}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{formatDate(period.payDate)}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{period.hours}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>{formatCurrency(period.grossPay)}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>{formatCurrency(period.federalTax)}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>{formatCurrency(period.socialSecurity)}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>{formatCurrency(period.medicare)}</td>
                  <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>{formatCurrency(period.netPay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Footer */}
      <div style={{
        marginTop: '25px',
        padding: '15px',
        border: '1px solid #000',
        backgroundColor: '#f5f5f5',
        fontSize: '9px',
        color: '#333'
      }}>
        <div style={{
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '10px',
          marginBottom: '10px',
          letterSpacing: '0.5px'
        }}>
          OFFICIAL ANNUAL WAGE AND TAX STATEMENT
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '10px'
        }}>
          <div>
            <strong>EMPLOYER CERTIFICATION:</strong><br/>
            This document certifies that the above information accurately reflects all compensation paid and taxes withheld for the employee during the specified tax year in compliance with federal tax regulations.
          </div>
          <div>
            <strong>EMPLOYEE NOTICE:</strong><br/>
            Retain this document for tax filing purposes. This statement contains information required for completing your federal income tax return and should be kept with your permanent tax records.
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          borderTop: '1px solid #ccc',
          paddingTop: '10px',
          fontSize: '8px',
          color: '#666'
        }}>
          <div>
            <strong>Document Generated:</strong> {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} | <strong>Reference:</strong> AWS-{employeeData.taxYear}-{generateReferenceId()}
          </div>
          <div style={{ marginTop: '5px' }}>
            This is an electronically generated document. No signature required for official use.
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
