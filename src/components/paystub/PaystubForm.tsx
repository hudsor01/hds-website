'use client'

import { getNoIncomeTaxStates, getIncomeTaxStates } from '@/lib/states-utils'
import type { PaystubData, FilingStatus } from '@/types/paystub'
import type { FormErrors } from '@/types/paystub'

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
    <div className="p-8 font-sans max-w-[900px] mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">
        Professional Pay Stub Generator
      </h1>

      {/* Employee Information */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-xl font-bold mb-5 text-gray-800">
          Employee Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Employee Name *
            </label>
            <input
              type="text"
              value={paystubData.employeeName}
              onChange={(e) => setPaystubData(prev => ({ ...prev, employeeName: e.target.value }))}
              className={`w-full p-2.5 border rounded-md text-sm ${
                formErrors.employeeName ? 'border-red-500 border-2' : 'border-gray-300'
              }`}
              placeholder="John Doe"
            />
            {formErrors.employeeName && (
              <p className="text-red-500 text-xs mt-1">{formErrors.employeeName}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Employee ID
            </label>
            <input
              type="text"
              value={paystubData.employeeId}
              onChange={(e) => setPaystubData(prev => ({ ...prev, employeeId: e.target.value }))}
              className="w-full p-2.5 border border-gray-300 rounded-md text-sm"
              placeholder="EMP001"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Employer Name
            </label>
            <input
              type="text"
              value={paystubData.employerName}
              onChange={(e) => setPaystubData(prev => ({ ...prev, employerName: e.target.value }))}
              className="w-full p-2.5 border border-gray-300 rounded-md text-sm"
              placeholder="ABC Company Inc."
            />
          </div>
        </div>
      </div>

      {/* Pay Information */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-xl font-bold mb-5 text-gray-800">
          Pay Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Hourly Rate *
            </label>
            <input
              type="number"
              step="0.01"
              value={paystubData.hourlyRate || ''}
              onChange={(e) => setPaystubData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
              className={`w-full p-2.5 border rounded-md text-sm ${
                formErrors.hourlyRate ? 'border-red-500 border-2' : 'border-gray-300'
              }`}
              placeholder="25.00"
            />
            {formErrors.hourlyRate && (
              <p className="text-red-500 text-xs mt-1">{formErrors.hourlyRate}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Hours Per Period *
            </label>
            <input
              type="number"
              step="0.5"
              value={paystubData.hoursPerPeriod || ''}
              onChange={(e) => setPaystubData(prev => ({ ...prev, hoursPerPeriod: parseFloat(e.target.value) || 0 }))}
              className={`w-full p-2.5 border rounded-md text-sm ${
                formErrors.hoursPerPeriod ? 'border-red-500 border-2' : 'border-gray-300'
              }`}
              placeholder="80"
            />
            {formErrors.hoursPerPeriod && (
              <p className="text-red-500 text-xs mt-1">{formErrors.hoursPerPeriod}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tax Information */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-xl font-bold mb-5 text-gray-800">
          Tax Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Filing Status
            </label>
            <select
              value={paystubData.filingStatus}
              onChange={(e) => setPaystubData(prev => ({ ...prev, filingStatus: e.target.value as FilingStatus }))}
              className="w-full p-2.5 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option value="single">Single</option>
              <option value="married_jointly">Married Filing Jointly</option>
              <option value="married_separately">Married Filing Separately</option>
              <option value="head_of_household">Head of Household</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Tax Year
            </label>
            <select
              value={paystubData.taxYear}
              onChange={(e) => setPaystubData(prev => ({ ...prev, taxYear: parseInt(e.target.value) }))}
              className="w-full p-2.5 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option value="">Select State</option>
              <optgroup label="No State Income Tax">
                {getNoIncomeTaxStates().map((state) => (
                  // use string properties from StateInfo so <option> value/key are strings
                  <option key={state.abbreviation ?? state.name} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="State Income Tax">
                {getIncomeTaxStates().map((state) => (
                  <option key={state.abbreviation ?? state.name} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`px-8 py-3 text-white rounded-md text-base font-semibold transition-all shadow-sm ${
            isGenerating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
          }`}
        >
          {isGenerating ? 'Generating...' : 'Generate Pay Stubs'}
        </button>

        <button
          onClick={onClear}
          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md text-base font-semibold cursor-pointer transition-all shadow-sm"
        >
          Clear Form
        </button>
      </div>
    </div>
  )
}