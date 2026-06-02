'use client'

import { useEffect, useRef } from 'react'
import {
	isSupportedStateCode,
	isSupportedTaxYear
} from '@/lib/paystub-calculator/supported-inputs'
import { usePaystubCalculations } from './use-paystub-calculations'
import { usePaystubForm } from './use-paystub-form'
import { usePaystubPersistence } from './use-paystub-persistence'
import { usePaystubUI } from './use-paystub-ui'
import { usePaystubUrlState } from './use-paystub-url-state'
import { usePaystubValidation } from './use-paystub-validation'

export function usePaystubGenerator() {
	const formState = usePaystubForm()
	const uiState = usePaystubUI()
	const { urlState, setUrlState, clearUrlState, generateShareableUrl } =
		usePaystubUrlState()

	// Track if we've initialized from URL params
	const hasInitializedFromUrl = useRef(false)

	const validation = usePaystubValidation({
		paystubData: formState.paystubData,
		selectedState: formState.selectedState,
		payFrequency: formState.payFrequency,
		overtimeHours: formState.overtimeHours,
		overtimeRate: formState.overtimeRate,
		additionalDeductions: formState.additionalDeductions
	})

	const calculations = usePaystubCalculations({
		paystubData: formState.paystubData,
		selectedState: formState.selectedState,
		payFrequency: formState.payFrequency,
		overtimeHours: formState.overtimeHours,
		overtimeRate: formState.overtimeRate,
		additionalDeductions: formState.additionalDeductions,
		setPaystubData: formState.setPaystubData,
		setResultsVisible: uiState.setResultsVisible,
		setDocumentType: uiState.setDocumentType,
		setSelectedPeriod: uiState.setSelectedPeriod
	})

	const persistence = usePaystubPersistence({
		paystubData: formState.paystubData,
		selectedState: formState.selectedState,
		setPaystubData: formState.setPaystubData,
		setSelectedState: formState.setSelectedState
	})

	// Initialize form from URL params on first load (URL takes priority over localStorage)
	useEffect(() => {
		if (hasInitializedFromUrl.current) {
			return
		}

		const hasAnyUrlParam = Object.values(urlState).some(v => v !== null)
		if (!hasAnyUrlParam) {
			hasInitializedFromUrl.current = true
			return
		}

		// Apply URL params to form state
		formState.setPaystubData(prev => ({
			...prev,
			employeeName: urlState.name ?? prev.employeeName,
			employeeId: urlState.id ?? prev.employeeId,
			employerName: urlState.employer ?? prev.employerName,
			hourlyRate: urlState.rate ?? prev.hourlyRate,
			hoursPerPeriod: urlState.hours ?? prev.hoursPerPeriod,
			filingStatus: urlState.status ?? prev.filingStatus,
			// Clamp a restored year to the supported set; a stale shared ?year=2024
			// (HIGH/LOW asymmetry: nuqs passes it through unchanged) falls back to the
			// form default rather than feeding an unbacked year into the calculation.
			taxYear:
				urlState.year != null && isSupportedTaxYear(urlState.year)
					? urlState.year
					: prev.taxYear
		}))

		if (urlState.state) {
			// Only restore a supported code; drop unsupported values (e.g. AL) so a
			// stale shared URL never feeds an unsupported state into the calculation
			// and never produces a defensive silent $0 (PAYSTUB-10).
			if (isSupportedStateCode(urlState.state)) {
				formState.setSelectedState(urlState.state.toUpperCase())
			}
		}

		hasInitializedFromUrl.current = true
	}, [urlState, formState])

	// Sync form state to URL when values change (after initial load)
	const { paystubData, selectedState } = formState
	const {
		employeeName,
		employeeId,
		employerName,
		hourlyRate,
		hoursPerPeriod,
		filingStatus,
		taxYear
	} = paystubData

	useEffect(() => {
		if (!hasInitializedFromUrl.current) {
			return
		}

		const hasData = employeeName || hourlyRate || hoursPerPeriod
		if (!hasData) {
			return
		}

		setUrlState({
			name: employeeName || null,
			id: employeeId || null,
			employer: employerName || null,
			rate: hourlyRate || null,
			hours: hoursPerPeriod || null,
			status: filingStatus,
			year: taxYear,
			state: selectedState || null
		})
	}, [
		employeeName,
		employeeId,
		employerName,
		hourlyRate,
		hoursPerPeriod,
		filingStatus,
		taxYear,
		selectedState,
		setUrlState
	])

	const handleClearForm = () => {
		formState.resetForm()
		uiState.resetUI()
		validation.resetErrors()
		persistence.clearForm()
		clearUrlState()
	}

	const generatePaystubs = () => {
		if (validation.validateForm()) {
			calculations.generatePaystubs()
		}
	}

	return {
		// Form state
		paystubData: formState.paystubData,
		setPaystubData: formState.setPaystubData,
		selectedState: formState.selectedState,
		setSelectedState: formState.setSelectedState,
		payFrequency: formState.payFrequency,
		setPayFrequency: formState.setPayFrequency,
		overtimeHours: formState.overtimeHours,
		setOvertimeHours: formState.setOvertimeHours,
		overtimeRate: formState.overtimeRate,
		setOvertimeRate: formState.setOvertimeRate,
		additionalDeductions: formState.additionalDeductions,
		setAdditionalDeductions: formState.setAdditionalDeductions,

		// UI state
		resultsVisible: uiState.resultsVisible,
		selectedPeriod: uiState.selectedPeriod,
		setSelectedPeriod: uiState.setSelectedPeriod,
		documentType: uiState.documentType,
		setDocumentType: uiState.setDocumentType,

		// Validation
		formErrors: validation.formErrors,

		// Calculations
		isGenerating: calculations.isGenerating,

		// Actions
		handleClearForm,
		generatePaystubs,
		handlePrint: uiState.handlePrint,
		backToForm: uiState.backToForm,

		// URL sharing
		generateShareableUrl
	}
}
