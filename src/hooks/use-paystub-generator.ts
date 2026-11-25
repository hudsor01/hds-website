'use client'

import { useEffect, useRef } from 'react'
import { usePaystubCalculations } from './use-paystub-calculations'
import { usePaystubForm } from './use-paystub-form'
import { usePaystubPersistence } from './use-paystub-persistence'
import { usePaystubUI } from './use-paystub-ui'
import {
	applyPaystubUrlState,
	hasPaystubUrlState,
	readPaystubUrlState,
	restoredPaystubStateCode
} from './use-paystub-url-state'
import { usePaystubValidation } from './use-paystub-validation'

const noop = () => undefined

export function usePaystubGenerator() {
	const formState = usePaystubForm()
	const uiState = usePaystubUI()
	// Track if we've initialized from URL params
	const hasInitializedFromUrl = useRef(false)
	// Set by PaystubUrlSync once it mounts
	const clearUrlRef = useRef<() => void>(noop)

	const validation = usePaystubValidation({
		paystubData: formState.paystubData,
		selectedState: formState.selectedState,
		payFrequency: formState.payFrequency,
		overtimeHours: formState.overtimeHours,
		overtimeRate: formState.overtimeRate,
		additionalDeductions: formState.additionalDeductions,
		withholding: formState.withholding
	})

	const calculations = usePaystubCalculations({
		paystubData: formState.paystubData,
		selectedState: formState.selectedState,
		payFrequency: formState.payFrequency,
		overtimeHours: formState.overtimeHours,
		overtimeRate: formState.overtimeRate,
		additionalDeductions: formState.additionalDeductions,
		withholding: formState.withholding,
		setPaystubData: formState.setPaystubData,
		setResultsVisible: uiState.setResultsVisible,
		setDocumentType: uiState.setDocumentType,
		setSelectedPeriod: uiState.setSelectedPeriod
	})

	const persistence = usePaystubPersistence({
		paystubData: formState.paystubData,
		selectedState: formState.selectedState,
		setPaystubData: formState.setPaystubData,
		setSelectedState: formState.setSelectedState,
		withholding: formState.withholding,
		setWithholding: formState.setWithholding
	})

	// Restore a shared link once, after the localStorage restore above, so
	// the URL takes priority. It reads window.location directly rather than
	// through nuqs, so the page does not read search params while it
	// prerenders; PaystubUrlSync mirrors later changes back to the URL.
	const { setPaystubData, setSelectedState } = formState
	useEffect(() => {
		if (hasInitializedFromUrl.current) {
			return
		}
		hasInitializedFromUrl.current = true

		const urlState = readPaystubUrlState(window.location.search)
		if (!hasPaystubUrlState(urlState)) {
			return
		}

		setPaystubData(prev => applyPaystubUrlState(prev, urlState))
		const stateCode = restoredPaystubStateCode(urlState)
		if (stateCode) {
			setSelectedState(stateCode)
		}
	}, [setPaystubData, setSelectedState])

	const handleClearForm = () => {
		formState.resetForm()
		uiState.resetUI()
		validation.resetErrors()
		persistence.clearForm()
		clearUrlRef.current()
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
		withholding: formState.withholding,
		setWithholding: formState.setWithholding,

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

		// URL sync (PaystubUrlSync)
		clearUrlRef
	}
}
