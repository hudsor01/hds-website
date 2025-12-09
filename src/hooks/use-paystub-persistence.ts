import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { clearFormData, loadFormData, saveFormData } from "@/lib/paystub-calculator/storage";
import type { PaystubData, FilingStatus } from "@/types/paystub";

interface UsePaystubPersistenceProps {
  paystubData: PaystubData;
  selectedState: string;
  setPaystubData: React.Dispatch<React.SetStateAction<PaystubData>>;
  setSelectedState: (state: string) => void;
}

export function usePaystubPersistence({
  paystubData,
  selectedState,
  setPaystubData,
  setSelectedState,
}: UsePaystubPersistenceProps) {
  // Load saved form data on mount
  useEffect(() => {
    const savedData = loadFormData();
    if (!savedData) {
      return;
    }

    logger.info("Paystub form data restored from previous session", {
      component: "usePaystubPersistence",
      userFlow: "paystub_tool_usage",
      action: "form_data_restored",
      businessValue: "medium",
      restoredFields: {
        employeeName: !!savedData.employeeName,
        employeeId: !!savedData.employeeId,
        employerName: !!savedData.employerName,
        hourlyRate: !!savedData.hourlyRate,
        hoursPerPeriod: !!savedData.hoursPerPeriod,
        state: !!savedData.state,
        taxYear: savedData.taxYear,
      },
    });

    setPaystubData((prev) => ({
      ...prev,
      employeeName: savedData.employeeName,
      employeeId: savedData.employeeId,
      employerName: savedData.employerName,
      hourlyRate: savedData.hourlyRate,
      hoursPerPeriod: savedData.hoursPerPeriod,
      filingStatus: savedData.filingStatus as FilingStatus,
      taxYear: savedData.taxYear,
    }));

    if (savedData.state) {
      setSelectedState(savedData.state);
    }

    toast.success("Form data restored from previous session");
  }, [setPaystubData, setSelectedState]);

  // Auto-save form data
  const saveCurrentFormData = useCallback(() => {
    const dataToSave = {
      employeeName: paystubData.employeeName,
      employeeId: paystubData.employeeId,
      employerName: paystubData.employerName,
      hourlyRate: paystubData.hourlyRate,
      hoursPerPeriod: paystubData.hoursPerPeriod,
      filingStatus: paystubData.filingStatus,
      taxYear: paystubData.taxYear,
      state: selectedState,
    };
    saveFormData(dataToSave);
  }, [paystubData, selectedState]);

  // Save form data whenever it changes
  useEffect(() => {
    if (paystubData.employeeName || paystubData.hourlyRate || paystubData.hoursPerPeriod) {
      saveCurrentFormData();
    }
  }, [paystubData, selectedState, saveCurrentFormData]);

  const clearForm = () => {
    logger.info("Paystub form cleared by user", {
      component: "usePaystubPersistence",
      userFlow: "paystub_tool_usage",
      action: "form_cleared",
      businessValue: "low",
      hadData: !!(paystubData.employeeName || paystubData.hourlyRate || paystubData.hoursPerPeriod),
    });

    clearFormData();
    toast.success("Form cleared successfully");

    // Focus first input for accessibility
    setTimeout(() => {
      const firstInput = document.querySelector("input[type=\"text\"]") as HTMLInputElement | null;
      firstInput?.focus();
    }, 100);
  };

  return {
    clearForm,
  };
}
