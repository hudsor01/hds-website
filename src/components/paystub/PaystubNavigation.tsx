'use client'

interface PaystubNavigationProps {
  selectedPeriod: number
  setSelectedPeriod: (period: number) => void
  documentType: 'form' | 'paystub' | 'annual'
  setDocumentType: (type: 'form' | 'paystub' | 'annual') => void
  onBackToForm: () => void
  onPrint: () => void
}

export function PaystubNavigation({
  selectedPeriod,
  setSelectedPeriod,
  documentType,
  setDocumentType,
  onBackToForm,
  onPrint
}: PaystubNavigationProps) {
  return (
    <div className="p-5 text-center bg-muted">
      <div className="mb-5">
        <button
          onClick={onBackToForm}
          className="button-base px-5 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm mr-2.5 transition-smooth"
        >
          ← Back to Form
        </button>

        <button
          onClick={() => setDocumentType('paystub')}
          className={`button-base px-5 py-2.5 rounded-md text-sm mr-2.5 transition-smooth ${
            documentType === 'paystub'
              ? 'cta-primary'
              : 'bg-gray-200 text-muted-foreground hover:bg-gray-300'
          }`}
        >
          Pay Stub
        </button>

        <button
          onClick={() => setDocumentType('annual')}
          className={`button-base px-5 py-2.5 rounded-md text-sm transition-smooth ${
            documentType === 'annual'
              ? 'cta-primary'
              : 'bg-gray-200 text-muted-foreground hover:bg-gray-300'
          }`}
        >
          W-2 Summary
        </button>
      </div>

      {documentType === 'paystub' && (
        <div className="mb-5">
          <label className="mr-2.5 font-medium">Select Pay Period:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
            className="px-3 py-2 border border-border rounded-md text-sm bg-white"
          >
            {Array.from({ length: 26 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Period {i + 1}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={onPrint}
        className="button-base px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-smooth"
      >
        Print {documentType === 'paystub' ? 'Pay Stub' : 'W-2 Summary'}
      </button>
    </div>
  )
}