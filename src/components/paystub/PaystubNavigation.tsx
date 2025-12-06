'use client'

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
      <div className="mb-5 flex flex-wrap justify-center gap-tight">
        <Button variant="secondary" onClick={onBackToForm}>
          Back to Form
        </Button>

        <Button
          variant={documentType === 'paystub' ? 'default' : 'outline'}
          onClick={() => setDocumentType('paystub')}
        >
          Pay Stub
        </Button>

        <Button
          variant={documentType === 'annual' ? 'default' : 'outline'}
          onClick={() => setDocumentType('annual')}
        >
          W-2 Summary
        </Button>
      </div>

      {documentType === 'paystub' && (
        <div className="mb-5 flex items-center justify-center gap-tight">
          <Label>Select Pay Period:</Label>
          <Select
            value={selectedPeriod.toString()}
            onValueChange={(value) => setSelectedPeriod(parseInt(value))}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 26 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  Period {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button onClick={onPrint} className="bg-success-dark hover:bg-success-darker">
        Print {documentType === 'paystub' ? 'Pay Stub' : 'W-2 Summary'}
      </Button>
    </div>
  )
}
