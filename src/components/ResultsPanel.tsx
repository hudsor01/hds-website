import { AlertCircle, Check, CreditCard, DollarSign, FileText, Mail, Plus, Save, Share2 } from 'lucide-react'
import type { CalculationResults, PaymentResults, TTLResults, VehicleInputs } from '../types/ttl-types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ResultsPanelProps {
  vehicleInput: VehicleInputs;
  calculationResults: CalculationResults | null;
  isLoading: boolean;
  error: string | null;
  handleSaveCalculation: () => void;
  saveSuccess: boolean;
  handleEmailResults: () => void;
  handleShareLink: () => void;
  handlePrintPDF: () => void;
  addToComparison: () => void;
  comparisonVehicles: Array<{
    input: VehicleInputs;
    ttl: TTLResults;
    payment: PaymentResults;
    name: string;
  }>;
}

export function ResultsPanel({
  calculationResults,
  isLoading,
  error,
  handleSaveCalculation,
  saveSuccess,
  handleEmailResults,
  handleShareLink,
  handlePrintPDF,
  addToComparison,
  comparisonVehicles
}: ResultsPanelProps) {
  return (
    <Card>
      <CardContent className="card-padding space-y-comfortable">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-tight">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Calculation Results</h2>
          </div>
          {calculationResults && (
            <div className="rounded-full bg-secondary px-3 py-1 text-sm font-medium">
              Texas
            </div>
          )}
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-heading"></div>
            <p className="text-muted-foreground font-medium">Calculating your results...</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-content rounded-lg border bg-destructive/10 card-padding-sm">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="text-destructive font-medium">{error}</p>
            </div>
          </div>
        )}

      {calculationResults && (
        <>
          {/* TTL Breakdown */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-tight">
                <CreditCard className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg">TTL Breakdown</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Sales Tax (6.25%)</span>
                <span className="font-medium">${calculationResults.ttlResults?.salesTax.toFixed(2) || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Title & Local Fees</span>
                <span className="font-medium">${calculationResults.ttlResults?.titleFee.toFixed(2) || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Registration</span>
                <span className="font-medium">${calculationResults.ttlResults?.registrationFees.toFixed(2) || 0}</span>
              </div>
              {calculationResults.ttlResults?.evFee && calculationResults.ttlResults.evFee > 0 && (
                <div className="flex justify-between items-center">
                  <span>EV Fee</span>
                  <span className="font-medium">${calculationResults.ttlResults?.evFee.toFixed(2)}</span>
                </div>
              )}
              {calculationResults.ttlResults?.emissions && calculationResults.ttlResults.emissions > 0 && (
                <div className="flex justify-between items-center">
                  <span>Emissions</span>
                  <span className="font-medium">${calculationResults.ttlResults?.emissions.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total TTL</span>
                  <span>${calculationResults.ttlResults?.totalTTL.toFixed(2) || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Payment */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-tight">
                <DollarSign className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg">Monthly Payment</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Loan Amount</span>
                <span className="font-medium">${calculationResults.paymentResults?.loanAmount.toFixed(2) || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Monthly Payment</span>
                <span className="font-bold text-xl">${calculationResults.paymentResults?.monthlyPayment.toFixed(2) || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Interest</span>
                <span className="font-medium">${calculationResults.paymentResults?.totalInterest.toFixed(2) || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Amount Financed</span>
                <span className="font-medium">${calculationResults.paymentResults?.totalFinanced.toFixed(2) || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleSaveCalculation}
              className="gap-tight"
              variant={saveSuccess ? "default" : "default"}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </>
              )}
            </Button>

            <Button
              onClick={handleEmailResults}
              className="gap-tight"
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </Button>

            <Button
              onClick={handleShareLink}
              className="gap-tight"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>

            <Button
              onClick={handlePrintPDF}
              className="gap-tight"
            >
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </Button>
          </div>

          <Button
            onClick={addToComparison}
            disabled={comparisonVehicles.length >= 3}
            className="w-full gap-tight"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Comparison {comparisonVehicles.length > 0 ? `(${comparisonVehicles.length}/3)` : ''}</span>
          </Button>
        </>
      )}

      {!calculationResults && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Enter vehicle information to see calculation results</p>
        </div>
      )}

      <div className="rounded-lg border bg-secondary/10 p-3 text-xs text-muted-foreground">
        <p><strong>Note:</strong> This calculator provides estimates based on Texas state fees and regulations. Actual fees may vary by county and specific circumstances. Always verify with your local Texas DMV office.</p>
      </div>
    </CardContent>
  </Card>
  );
}
