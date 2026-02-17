/**
 * Paystub Calculator
 * Generate detailed payroll breakdowns with federal and state tax calculations
 */

'use client';

import { CalculatorLayout } from '@/components/calculators/CalculatorLayout';
import { PaystubForm } from '@/components/paystub/PaystubForm';
import { PaystubNavigation } from '@/components/paystub/PaystubNavigation';
import { usePaystubGenerator } from '@/hooks/use-paystub-generator';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Banknote } from 'lucide-react';

export default function PaystubCalculatorClient() {
  const generator = usePaystubGenerator();

  return (
    <CalculatorLayout
      title="Paystub Calculator"
      description="Generate accurate payroll breakdowns with federal and state tax calculations for any pay period"
      icon={<Banknote className="h-8 w-8 text-primary" />}
    >
      <PaystubForm
        paystubData={generator.paystubData}
        setPaystubData={generator.setPaystubData}
        selectedState={generator.selectedState}
        setSelectedState={generator.setSelectedState}
        payFrequency={generator.payFrequency}
        setPayFrequency={generator.setPayFrequency}
        overtimeHours={generator.overtimeHours}
        setOvertimeHours={generator.setOvertimeHours}
        overtimeRate={generator.overtimeRate}
        setOvertimeRate={generator.setOvertimeRate}
        additionalDeductions={generator.additionalDeductions}
        setAdditionalDeductions={generator.setAdditionalDeductions}
        formErrors={generator.formErrors}
        onGenerate={generator.generatePaystubs}
        onClear={generator.handleClearForm}
        isGenerating={generator.isGenerating}
      />

      {generator.resultsVisible && generator.paystubData.payPeriods.length > 0 && (
        <div className="mt-comfortable space-y-comfortable border-t border-border pt-comfortable">
          <PaystubNavigation
            selectedPeriod={generator.selectedPeriod}
            setSelectedPeriod={generator.setSelectedPeriod}
            documentType={generator.documentType}
            setDocumentType={generator.setDocumentType}
            onBackToForm={generator.backToForm}
            onPrint={generator.handlePrint}
            payPeriods={generator.paystubData.payPeriods}
          />

          {/* Pay Period Detail */}
          {generator.paystubData.payPeriods
            .filter(p => p.period === generator.selectedPeriod)
            .map(period => (
              <Card key={period.period}>
                <h3 className="text-lg font-semibold text-foreground mb-heading">
                  Period {period.period} - {period.payDate}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hours Worked</span>
                    <span className="font-medium text-foreground">{period.hours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Pay</span>
                    <span className="font-medium text-foreground">{formatCurrency(period.grossPay)}</span>
                  </div>
                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Federal Tax</span>
                      <span className="text-destructive-dark">-{formatCurrency(period.federalTax)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Social Security</span>
                      <span className="text-destructive-dark">-{formatCurrency(period.socialSecurity)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Medicare</span>
                      <span className="text-destructive-dark">-{formatCurrency(period.medicare)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">State Tax</span>
                      <span className="text-destructive-dark">-{formatCurrency(period.stateTax)}</span>
                    </div>
                    {period.otherDeductions > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Other Deductions</span>
                        <span className="text-destructive-dark">-{formatCurrency(period.otherDeductions)}</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-semibold text-foreground">Net Pay</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(period.netPay)}</span>
                  </div>
                </div>
              </Card>
            ))}

          {/* Annual Totals */}
          <Card className="bg-accent/10 dark:bg-primary/20">
            <h3 className="text-lg font-semibold text-foreground mb-heading">Annual Totals</h3>
            <div className="grid gap-content sm:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground">Total Hours</div>
                <div className="text-lg font-semibold text-foreground">{generator.paystubData.totals.hours}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Gross Pay</div>
                <div className="text-lg font-semibold text-foreground">{formatCurrency(generator.paystubData.totals.grossPay)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Deductions</div>
                <div className="text-lg font-semibold text-destructive-dark">
                  -{formatCurrency(
                    generator.paystubData.totals.federalTax +
                    generator.paystubData.totals.socialSecurity +
                    generator.paystubData.totals.medicare +
                    generator.paystubData.totals.stateTax +
                    generator.paystubData.totals.otherDeductions
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Net Pay</div>
                <div className="text-xl font-bold text-primary">{formatCurrency(generator.paystubData.totals.netPay)}</div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </CalculatorLayout>
  );
}
