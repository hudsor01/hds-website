'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormField, CurrencyInput } from '@/components/forms'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getIncomeTaxStates, getNoIncomeTaxStates } from '@/lib/paystub-calculator/states-utils'
import type { FilingStatus, FormErrors, PaystubData, PayFrequency } from '@/types/paystub'

interface PaystubFormProps {
  paystubData: PaystubData
  setPaystubData: React.Dispatch<React.SetStateAction<PaystubData>>
  selectedState: string
  setSelectedState: React.Dispatch<React.SetStateAction<string>>
  payFrequency: PayFrequency
  setPayFrequency: React.Dispatch<React.SetStateAction<PayFrequency>>
  overtimeHours: number
  setOvertimeHours: React.Dispatch<React.SetStateAction<number>>
  overtimeRate: number
  setOvertimeRate: React.Dispatch<React.SetStateAction<number>>
  additionalDeductions: Array<{ name: string; amount: number }>
  setAdditionalDeductions: React.Dispatch<React.SetStateAction<Array<{ name: string; amount: number }>>>
  formErrors: FormErrors
  onGenerate: () => void
  onClear: () => void
  isGenerating: boolean
}

export function PaystubForm({
  paystubData,
  setPaystubData,
  selectedState,
  setSelectedState,
  payFrequency,
  setPayFrequency,
  overtimeHours,
  setOvertimeHours,
  overtimeRate,
  setOvertimeRate,
  additionalDeductions,
  setAdditionalDeductions,
  formErrors,
  onGenerate,
  onClear,
  isGenerating
}: PaystubFormProps) {
  return (
    <div className="card-padding-lg font-sans container-narrow">
      <h2 className="text-3xl font-bold mb-comfortable text-center text-foreground">
        Professional Pay Stub Generator
      </h2>

      {/* Employee Information */}
      <Card className="mb-comfortable">
        <h2 className="text-xl font-bold mb-5 text-foreground">
          Employee Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FormField
            label="Employee Name"
            id="employeeName"
            value={paystubData.employeeName}
            onChange={(value) => setPaystubData(prev => ({ ...prev, employeeName: value }))}
            error={formErrors.employeeName}
            required
            placeholder="John Doe"
          />

          <FormField
            label="Employee ID"
            id="employeeId"
            value={paystubData.employeeId}
            onChange={(value) => setPaystubData(prev => ({ ...prev, employeeId: value }))}
            placeholder="EMP001"
          />

          <FormField
            label="Employer Name"
            id="employerName"
            value={paystubData.employerName}
            onChange={(value) => setPaystubData(prev => ({ ...prev, employerName: value }))}
            placeholder="ABC Company Inc."
          />
        </div>
      </Card>

      {/* Pay Information */}
      <Card className="mb-comfortable">
        <h2 className="text-xl font-bold mb-5 text-foreground">
          Pay Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CurrencyInput
            label="Hourly Rate"
            id="hourlyRate"
            value={paystubData.hourlyRate}
            onChange={(value) => setPaystubData(prev => ({ ...prev, hourlyRate: value }))}
            error={formErrors.hourlyRate}
            required
            placeholder="25.00"
          />

          <FormField
            label="Hours Per Period"
            id="hoursPerPeriod"
            type="number"
            step="0.5"
            value={paystubData.hoursPerPeriod}
            onChange={(value) => setPaystubData(prev => ({ ...prev, hoursPerPeriod: parseFloat(value) || 0 }))}
            error={formErrors.hoursPerPeriod}
            required
            placeholder="80"
          />
        </div>
      </Card>

      {/* Tax Information */}
      <Card className="mb-comfortable">
        <h2 className="text-xl font-bold mb-5 text-foreground">
          Tax Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-tight">
            <Label htmlFor="filingStatus">Filing Status</Label>
            <Select
              value={paystubData.filingStatus}
              onValueChange={(value) => setPaystubData(prev => ({ ...prev, filingStatus: value as FilingStatus }))}
            >
              <SelectTrigger id="filingStatus">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="marriedJoint">Married Filing Jointly</SelectItem>
                <SelectItem value="marriedSeparate">Married Filing Separately</SelectItem>
                <SelectItem value="headOfHousehold">Head of Household</SelectItem>
                <SelectItem value="qualifyingSurvivingSpouse">Qualifying Surviving Spouse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-tight">
            <Label htmlFor="taxYear">Tax Year</Label>
            <Select
              value={paystubData.taxYear.toString()}
              onValueChange={(value) => setPaystubData(prev => ({ ...prev, taxYear: parseInt(value) }))}
            >
              <SelectTrigger id="taxYear">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-tight">
            <Label htmlFor="state">State</Label>
            <Select
              value={selectedState}
              onValueChange={setSelectedState}
            >
              <SelectTrigger id="state">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>No State Income Tax</SelectLabel>
                  {getNoIncomeTaxStates().map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>State Income Tax</SelectLabel>
                  {getIncomeTaxStates().map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Pay Frequency */}
      <Card className="mb-comfortable">
        <h2 className="text-xl font-bold mb-5 text-foreground">
          Pay Frequency
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
          <div className="space-y-tight">
            <Label htmlFor="payFrequency">Pay Period</Label>
            <Select
              value={payFrequency}
              onValueChange={(value) => setPayFrequency(value as PayFrequency)}
            >
              <SelectTrigger id="payFrequency">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly (52 periods)</SelectItem>
                <SelectItem value="biweekly">Bi-weekly (26 periods)</SelectItem>
                <SelectItem value="semimonthly">Semi-monthly (24 periods)</SelectItem>
                <SelectItem value="monthly">Monthly (12 periods)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Overtime Information */}
      <Card className="mb-comfortable">
        <h2 className="text-xl font-bold mb-5 text-foreground">
          Overtime
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            label="Overtime Hours"
            id="overtimeHours"
            type="number"
            step="0.5"
            value={overtimeHours}
            onChange={(value) => setOvertimeHours(parseFloat(value) || 0)}
            placeholder="0"
          />

          <CurrencyInput
            label="Overtime Rate (per hour)"
            id="overtimeRate"
            value={overtimeRate}
            onChange={(value) => setOvertimeRate(value)}
            placeholder="37.50"
          />
        </div>
      </Card>

      {/* Additional Deductions */}
      <Card className="mb-comfortable">
        <h2 className="text-xl font-bold mb-5 text-foreground">
          Additional Deductions
        </h2>
        <div className="space-y-3">
          {additionalDeductions.map((deduction, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Deduction name (e.g., Health Insurance)"
                value={deduction.name}
                onChange={(e) => {
                  const newDeductions = [...additionalDeductions];
                  if (newDeductions[index]) {
                    newDeductions[index].name = e.target.value;
                    setAdditionalDeductions(newDeductions);
                  }
                }}
              />
              <div className="flex gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={deduction.amount || ''}
                    onChange={(e) => {
                      const newDeductions = [...additionalDeductions];
                      if (newDeductions[index]) {
                        newDeductions[index].amount = parseFloat(e.target.value) || 0;
                        setAdditionalDeductions(newDeductions);
                      }
                    }}
                    variant="currency"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setAdditionalDeductions(additionalDeductions.filter((_, i) => i !== index));
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setAdditionalDeductions([...additionalDeductions, { name: '', amount: 0 }]);
            }}
          >
            Add Deduction
          </Button>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex-center gap-content">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          size="lg"
          className="px-8"
        >
          {isGenerating ? 'Generating...' : 'Generate Pay Stubs'}
        </Button>

        <Button
          onClick={onClear}
          variant="destructive"
          size="lg"
          className="px-8"
        >
          Clear Form
        </Button>
      </div>
    </div>
  )
}
