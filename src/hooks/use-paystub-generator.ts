"use client";

import { usePaystubForm } from "./use-paystub-form";
import { usePaystubUI } from "./use-paystub-ui";
import { usePaystubValidation } from "./use-paystub-validation";
import { usePaystubCalculations } from "./use-paystub-calculations";
import { usePaystubPersistence } from "./use-paystub-persistence";

export function usePaystubGenerator() {
  const formState = usePaystubForm();
  const uiState = usePaystubUI();

  const validation = usePaystubValidation({
    paystubData: formState.paystubData,
    selectedState: formState.selectedState,
    payFrequency: formState.payFrequency,
    overtimeHours: formState.overtimeHours,
    overtimeRate: formState.overtimeRate,
    additionalDeductions: formState.additionalDeductions,
  });

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
    setSelectedPeriod: uiState.setSelectedPeriod,
  });

  const persistence = usePaystubPersistence({
    paystubData: formState.paystubData,
    selectedState: formState.selectedState,
    setPaystubData: formState.setPaystubData,
    setSelectedState: formState.setSelectedState,
  });

  const handleClearForm = () => {
    formState.resetForm();
    uiState.resetUI();
    validation.resetErrors();
    persistence.clearForm();
  };

  const generatePaystubs = () => {
    if (validation.validateForm()) {
      calculations.generatePaystubs();
    }
  };

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
  };
}
