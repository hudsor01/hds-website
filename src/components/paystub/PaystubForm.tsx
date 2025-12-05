'use client'

import { getIncomeTaxStates, getNoIncomeTaxStates } from '@/lib/paystub-calculator/states-utils'
import type { FilingStatus, FormErrors, PaystubData } from '@/types/paystub'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/Button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PaystubFormProps {
  paystubData: PaystubData
  setPaystubData: React.Dispatch<React.SetStateAction<PaystubData>>
  selectedState: string
  setSelectedState: React.Dispatch<React.SetStateAction<string>>
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
  formErrors,
  onGenerate,
  onClear,
  isGenerating
}: PaystubFormProps) {
  return (
    <div className="card-padding-lg font-sans container-narrow">
      <h1 className="text-3xl font-bold mb-comfortable text-center text-foreground">
        Professional Pay Stub Generator
      </h1>

      {/* Employee Information */}
      <div className="mb-comfortable card-padding bg-muted rounded-lg border border-border">
        <h2 className="text-xl font-bold mb-5 text-foreground">
          Employee Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-tight">
            <Label htmlFor="employeeName">Employee Name *</Label>
            <Input
              id="employeeName"
              type="text"
              value={paystubData.employeeName}
              onChange={(e) => setPaystubData(prev => ({ ...prev, employeeName: e.target.value }))}
              className={formErrors.employeeName ? 'border-destructive border-2' : ''}
              placeholder="John Doe"
            />
            {formErrors.employeeName && (
              <p className="text-destructive text-xs">{formErrors.employeeName}</p>
            )}
          </div>

          <div className="space-y-tight">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              type="text"
              value={paystubData.employeeId}
              onChange={(e) => setPaystubData(prev => ({ ...prev, employeeId: e.target.value }))}
              placeholder="EMP001"
            />
          </div>

          <div className="space-y-tight">
            <Label htmlFor="employerName">Employer Name</Label>
            <Input
              id="employerName"
              type="text"
              value={paystubData.employerName}
              onChange={(e) => setPaystubData(prev => ({ ...prev, employerName: e.target.value }))}
              placeholder="ABC Company Inc."
            />
          </div>
        </div>
      </div>

      {/* Pay Information */}
      <div className="mb-comfortable card-padding bg-muted rounded-lg border border-border">
        <h2 className="text-xl font-bold mb-5 text-foreground">
          Pay Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-tight">
            <Label htmlFor="hourlyRate">Hourly Rate *</Label>
            <Input
              id="hourlyRate"
              type="number"
              step="0.01"
              value={paystubData.hourlyRate || ''}
              onChange={(e) => setPaystubData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
              className={formErrors.hourlyRate ? 'border-destructive border-2' : ''}
              placeholder="25.00"
            />
            {formErrors.hourlyRate && (
              <p className="text-destructive text-xs">{formErrors.hourlyRate}</p>
            )}
          </div>

          <div className="space-y-tight">
            <Label htmlFor="hoursPerPeriod">Hours Per Period *</Label>
            <Input
              id="hoursPerPeriod"
              type="number"
              step="0.5"
              value={paystubData.hoursPerPeriod || ''}
              onChange={(e) => setPaystubData(prev => ({ ...prev, hoursPerPeriod: parseFloat(e.target.value) || 0 }))}
              className={formErrors.hoursPerPeriod ? 'border-destructive border-2' : ''}
              placeholder="80"
            />
            {formErrors.hoursPerPeriod && (
              <p className="text-destructive text-xs">{formErrors.hoursPerPeriod}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tax Information */}
      <div className="mb-comfortable card-padding bg-muted rounded-lg border border-border">
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
                <SelectItem value="married_jointly">Married Filing Jointly</SelectItem>
                <SelectItem value="married_separately">Married Filing Separately</SelectItem>
                <SelectItem value="head_of_household">Head of Household</SelectItem>
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
                    <SelectItem key={state.value} value={state.label}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>State Income Tax</SelectLabel>
                  {getIncomeTaxStates().map((state) => (
                    <SelectItem key={state.value} value={state.label}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

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
