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
  // TEMPORARY FIX: Disabled localStorage restoration due to infinite loop bug
  // TODO: Re-enable after fixing the React re-render cycle issue
  // The restoration triggers infinite re-renders when combined with the Select components
  useEffect(() => {
    // Temporarily disabled to prevent infinite loop bug
    // const savedData = loadFormData();
    // if (!savedData) {
    //   return;
    // }
    
    logger.info("Paystub persistence temporarily disabled", {
      component: "usePaystubPersistence",
      userFlow: "paystub_tool_usage",
      action: "persistence_disabled",
      businessValue: "low",
      reason: "infinite_loop_bug_fix",
    });
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

  // TEMPORARY FIX: Disabled auto-save due to infinite loop bug
  // Save form data whenever it changes
  useEffect(() => {
    // Temporarily disabled to prevent infinite loop bug
    // if (paystubData.employeeName || paystubData.hourlyRate || paystubData.hoursPerPeriod) {
    //   saveCurrentFormData();
    // }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paystubData, selectedState]);

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
