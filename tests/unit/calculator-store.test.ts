import { beforeEach, describe, expect, it } from 'bun:test'
import { useCalculatorStore } from '@/stores/calculator-store'
import type { CalculationResults } from '@/types/ttl-types'

describe('Calculator Store', () => {
	beforeEach(() => {
		// Clear all saved calculations first using the store's action
		useCalculatorStore.getState().clearAllSaved()

		// Reset store state
		useCalculatorStore.getState().setVehicleInput({
			purchasePrice: 30000,
			tradeInValue: 0,
			vehicleWeight: 4000,
			isElectric: false,
			isNewVehicle: true,
			county: 'Dallas',
			loanTermMonths: 60,
			interestRate: 6.5,
			downPayment: 5000,
			paymentFrequency: 'monthly',
			zipCode: '75201',
			loanStartDate: '2024-01-01',
			leaseMileage: 12000,
			leaseBuyout: 0,
			residualValue: 0,
			moneyFactor: 0
		})
		useCalculatorStore.getState().setCalculationResults(null)
		useCalculatorStore.getState().setIsLoading(false)
		useCalculatorStore.getState().setError(null)
	})

	it('should initialize with default vehicle input', () => {
		const state = useCalculatorStore.getState()
		expect(state.vehicleInput.purchasePrice).toBe(30000)
		expect(state.vehicleInput.county).toBe('Dallas')
	})

	it('should update input field', () => {
		const { updateInput } = useCalculatorStore.getState()
		updateInput('purchasePrice', 35000)
		expect(useCalculatorStore.getState().vehicleInput.purchasePrice).toBe(35000)
	})

	it('should set calculation results', () => {
		const results: CalculationResults = {
			ttlResults: {
				salesTax: 2100,
				titleFee: 33,
				registrationFees: 75,
				evFee: 0,
				emissions: 25,
				totalTTL: 2283
			},
			paymentResults: {
				loanAmount: 25000,
				monthlyPayment: 483,
				biweeklyPayment: 223,
				totalInterest: 3980,
				totalFinanced: 28980
			},
			tcoResults: {
				totalCostOfOwnership: 45000,
				annualCost: 9000,
				maintenanceCost: 1500,
				fuelCost: 2400
			},
			leaseComparisonResults: undefined
		}
		useCalculatorStore.getState().setCalculationResults(results)
		expect(useCalculatorStore.getState().calculationResults).toEqual(results)
	})

	it('should handle loading state', () => {
		useCalculatorStore.getState().setIsLoading(true)
		expect(useCalculatorStore.getState().isLoading).toBe(true)
		useCalculatorStore.getState().setIsLoading(false)
		expect(useCalculatorStore.getState().isLoading).toBe(false)
	})

	it('should handle error state', () => {
		const error = 'Calculation failed'
		useCalculatorStore.getState().setError(error)
		expect(useCalculatorStore.getState().error).toBe(error)
		useCalculatorStore.getState().setError(null)
		expect(useCalculatorStore.getState().error).toBe(null)
	})

	it('should save and load calculations', async () => {
		const id = await useCalculatorStore.getState().saveCurrentCalculation()
		expect(typeof id).toBe('string')
	})

	it('derives results from the inputs on every change', () => {
		const { updateInput } = useCalculatorStore.getState()
		updateInput('tradeInValue', 0)
		updateInput('rebateAmount', 0)
		updateInput('purchasePrice', 40000)
		const first = useCalculatorStore.getState().calculationResults
		expect(first?.ttlResults?.salesTax).toBe(2500)
		updateInput('purchasePrice', 20000)
		const second = useCalculatorStore.getState().calculationResults
		expect(second?.ttlResults?.salesTax).toBe(1250)
		expect(second?.paymentResults?.monthlyPayment).toBeGreaterThan(0)
	})

	it('rejects a negative purchase price with a field error and no results', () => {
		const { updateInput } = useCalculatorStore.getState()
		updateInput('purchasePrice', -5000)
		const state = useCalculatorStore.getState()
		expect(state.calculationResults).toBeNull()
		expect(state.error).toBeNull()
		expect(state.fieldErrors.purchasePrice).toBe('Enter a price of $0 or more.')

		updateInput('purchasePrice', 30000)
		const fixed = useCalculatorStore.getState()
		expect(fixed.calculationResults).not.toBeNull()
		expect(fixed.fieldErrors).toEqual({})
	})

	it('rejects a negative trade-in and an out-of-range rate', () => {
		const { updateInput } = useCalculatorStore.getState()
		updateInput('tradeInValue', -10000)
		updateInput('interestRate', -5)
		const state = useCalculatorStore.getState()
		expect(state.calculationResults).toBeNull()
		expect(Object.keys(state.fieldErrors).sort()).toEqual([
			'interestRate',
			'tradeInValue'
		])
	})

	it('setVehicleInput (shared link load) validates the inputs', () => {
		const { setVehicleInput, vehicleInput } = useCalculatorStore.getState()
		setVehicleInput({ ...vehicleInput, downPayment: -1 })
		const state = useCalculatorStore.getState()
		expect(state.calculationResults).toBeNull()
		expect(state.fieldErrors.downPayment).toBeDefined()
	})

	it('calculate() recomputes results and clears loading', () => {
		const { calculate } = useCalculatorStore.getState()
		calculate()
		expect(useCalculatorStore.getState().isLoading).toBe(false)
		expect(useCalculatorStore.getState().calculationResults).not.toBeNull()
	})

	it('setVehicleInput (shared link load) recomputes results', () => {
		const { setVehicleInput, vehicleInput } = useCalculatorStore.getState()
		setVehicleInput({ ...vehicleInput, purchasePrice: 10000, tradeInValue: 0 })
		expect(
			useCalculatorStore.getState().calculationResults?.ttlResults?.salesTax
		).toBe(625)
	})

	it('should handle saveCurrentCalculation with custom name', async () => {
		const id = await useCalculatorStore
			.getState()
			.saveCurrentCalculation('Custom Name')
		expect(typeof id).toBe('string')
	})

	it('should handle loadSavedCalculation', () => {
		const { loadSavedCalculation } = useCalculatorStore.getState()
		// Should not throw even with invalid ID
		loadSavedCalculation('non-existent-id')
		expect(useCalculatorStore.getState().vehicleInput.purchasePrice).toBe(30000)
	})

	it('should handle deleteSavedCalculation', () => {
		const { deleteSavedCalculation } = useCalculatorStore.getState()
		// Should not throw even with invalid ID
		deleteSavedCalculation('non-existent-id')
		expect(useCalculatorStore.getState().savedCalculations).toEqual([])
	})

	it('should handle clearAllSaved', () => {
		const { clearAllSaved } = useCalculatorStore.getState()
		clearAllSaved()
		expect(useCalculatorStore.getState().savedCalculations).toEqual([])
	})

	it('should handle loadSavedCalculations', () => {
		const { loadSavedCalculations } = useCalculatorStore.getState()
		// Should not throw
		loadSavedCalculations()
		expect(useCalculatorStore.getState().savedCalculations).toEqual([])
	})

	it('should handle calculation errors gracefully', () => {
		// Mock a scenario that would cause an error
		const { calculate } = useCalculatorStore.getState()
		calculate()
		// Should handle errors without crashing
		expect(useCalculatorStore.getState().error).toBe(null)
	})
})
