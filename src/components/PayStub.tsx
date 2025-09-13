import React from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PayPeriod, PaystubData } from '@/types/paystub'
import { FileText } from 'lucide-react'

interface PayStubProps {
  payPeriod: PayPeriod
  employeeData: PaystubData
  ytdTotals: {
    grossPay: number
    federalTax: number
    socialSecurity: number
    medicare: number
    netPay: number
  }
}

export const PayStub: React.FC<PayStubProps> = ({ payPeriod, employeeData, ytdTotals }) => {
  const handleSaveAsPDF = () => {
    window.print()
  }

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
        padding: '1in',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: '#000',
        border: '1px solid #ccc'
      }}>
      {/* Header */}
      <div style={{
        borderBottom: '2px solid #000',
        paddingBottom: '20px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              margin: '0 0 10px 0'
            }}>EARNINGS STATEMENT</h2>
            <div>
              <strong>{employeeData.employerName || '[EMPLOYER NAME]'}</strong><br/>
              <span style={{ fontSize: '10px', color: '#666' }}>
                Pay Period: {formatDate(payPeriod.payDate)} - {formatDate(payPeriod.payDate)}<br/>
                Pay Date: {formatDate(payPeriod.payDate)}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              border: '1px solid #000',
              padding: '10px',
              backgroundColor: '#f9f9f9'
            }}>
              <strong>CHECK #{payPeriod.period.toString().padStart(4, '0')}</strong><br/>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {formatCurrency(payPeriod.netPay)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Information */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>EMPLOYEE</h4>
          <div>
            <strong>{employeeData.employeeName}</strong><br/>
            {employeeData.employeeId && <span>ID: {employeeData.employeeId}<br/></span>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>PAY PERIOD</h4>
          <div>
            Period {payPeriod.period} of 26<br/>
            Tax Year: {employeeData.taxYear}
          </div>
        </div>
      </div>

      {/* Earnings Section */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ 
          margin: '0 0 10px 0', 
          fontSize: '14px',
          borderBottom: '1px solid #000',
          paddingBottom: '5px'
        }}>EARNINGS</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto auto',
          gap: '10px',
          alignItems: 'center'
        }}>
          <div><strong>Description</strong></div>
          <div style={{ textAlign: 'right' }}><strong>Rate</strong></div>
          <div style={{ textAlign: 'right' }}><strong>Hours</strong></div>
          <div style={{ textAlign: 'right' }}><strong>Current</strong></div>
          
          <div style={{ borderTop: '1px solid #ddd', paddingTop: '5px' }}>Regular</div>
          <div style={{ borderTop: '1px solid #ddd', paddingTop: '5px', textAlign: 'right' }}>
            {formatCurrency(employeeData.hourlyRate)}
          </div>
          <div style={{ borderTop: '1px solid #ddd', paddingTop: '5px', textAlign: 'right' }}>
            {payPeriod.hours}
          </div>
          <div style={{ borderTop: '1px solid #ddd', paddingTop: '5px', textAlign: 'right' }}>
            {formatCurrency(payPeriod.grossPay)}
          </div>
        </div>
        <div style={{
          borderTop: '2px solid #000',
          marginTop: '10px',
          paddingTop: '5px',
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: 'bold'
        }}>
          <span>TOTAL CURRENT EARNINGS:</span>
          <span>{formatCurrency(payPeriod.grossPay)}</span>
        </div>
      </div>

      {/* Deductions Section */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ 
          margin: '0 0 10px 0', 
          fontSize: '14px',
          borderBottom: '1px solid #000',
          paddingBottom: '5px'
        }}>DEDUCTIONS</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto',
          gap: '10px',
          alignItems: 'center'
        }}>
          <div><strong>Description</strong></div>
          <div style={{ textAlign: 'right' }}><strong>Current</strong></div>
          <div style={{ textAlign: 'right' }}><strong>YTD</strong></div>
          
          <div style={{ borderTop: '1px solid #ddd', paddingTop: '5px' }}>Federal Income Tax</div>
          <div style={{ borderTop: '1px solid #ddd', paddingTop: '5px', textAlign: 'right' }}>
            {formatCurrency(payPeriod.federalTax)}
          </div>
          <div style={{ borderTop: '1px solid #ddd', paddingTop: '5px', textAlign: 'right' }}>
            {formatCurrency(ytdTotals.federalTax)}
          </div>
          
          <div>Social Security Tax</div>
          <div style={{ textAlign: 'right' }}>{formatCurrency(payPeriod.socialSecurity)}</div>
          <div style={{ textAlign: 'right' }}>{formatCurrency(ytdTotals.socialSecurity)}</div>
          
          <div>Medicare Tax</div>
          <div style={{ textAlign: 'right' }}>{formatCurrency(payPeriod.medicare)}</div>
          <div style={{ textAlign: 'right' }}>{formatCurrency(ytdTotals.medicare)}</div>
        </div>
        <div style={{
          borderTop: '2px solid #000',
          marginTop: '10px',
          paddingTop: '5px',
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: 'bold'
        }}>
          <span>TOTAL CURRENT DEDUCTIONS:</span>
          <span>{formatCurrency(payPeriod.federalTax + payPeriod.socialSecurity + payPeriod.medicare)}</span>
        </div>
      </div>

      {/* Net Pay Summary */}
      <div style={{
        border: '2px solid #000',
        padding: '15px',
        backgroundColor: '#f0f0f0',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          <span>NET PAY:</span>
          <span>{formatCurrency(payPeriod.netPay)}</span>
        </div>
      </div>

      {/* Year-to-Date Summary */}
      <div style={{ borderTop: '1px solid #000', paddingTop: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>YEAR-TO-DATE TOTALS</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '10px',
          fontSize: '11px'
        }}>
          <div>Gross Earnings:</div>
          <div style={{ textAlign: 'right' }}>{formatCurrency(ytdTotals.grossPay)}</div>
          <div>Federal Income Tax:</div>
          <div style={{ textAlign: 'right' }}>{formatCurrency(ytdTotals.federalTax)}</div>
          <div>Social Security Tax:</div>
          <div style={{ textAlign: 'right' }}>{formatCurrency(ytdTotals.socialSecurity)}</div>
          <div>Medicare Tax:</div>
          <div style={{ textAlign: 'right' }}>{formatCurrency(ytdTotals.medicare)}</div>
          <div style={{ borderTop: '1px solid #000', paddingTop: '5px', fontWeight: 'bold' }}>Net Pay:</div>
          <div style={{ borderTop: '1px solid #000', paddingTop: '5px', textAlign: 'right', fontWeight: 'bold' }}>
            {formatCurrency(ytdTotals.netPay)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '30px',
        fontSize: '10px',
        color: '#666',
        borderTop: '1px solid #ddd',
        paddingTop: '10px'
      }}>
        <div style={{ textAlign: 'center' }}>
          This statement is for informational purposes only and does not constitute an official document.
          <br/>
          Please retain this statement for your records.
        </div>
      </div>
      </div>
    </div>
  )
}