import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { clearFormData, loadFormData, saveFormData } from "@/lib/paystub-calculator/storage";
import type { FilingStatus, PaystubData } from "@/types/paystub";

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
  // Track if initial load has completed to avoid save-on-load cycle
  const hasLoadedRef = useRef(false);
  const isInitialMountRef = useRef(true);

  // Load saved data on mount (runs once)
  useEffect(() => {
    // Skip if already loaded
    if (hasLoadedRef.current) {
      return;
    }

    const savedData = loadFormData();
    if (!savedData) {
      hasLoadedRef.current = true;
      return;
    }

    logger.info("Restoring paystub form data from localStorage", {
      component: "usePaystubPersistence",
      userFlow: "paystub_tool_usage",
      action: "data_restored",
      businessValue: "medium",
    });

    // Restore form data (cast filingStatus to proper type)
    setPaystubData((prev) => ({
      ...prev,
      employeeName: savedData.employeeName || prev.employeeName,
      employeeId: savedData.employeeId || prev.employeeId,
      employerName: savedData.employerName || prev.employerName,
      hourlyRate: savedData.hourlyRate || prev.hourlyRate,
      hoursPerPeriod: savedData.hoursPerPeriod || prev.hoursPerPeriod,
      filingStatus: (savedData.filingStatus as FilingStatus) || prev.filingStatus,
      taxYear: savedData.taxYear || prev.taxYear,
    }));

    // Restore selected state if saved
    if (savedData.state) {
      setSelectedState(savedData.state);
    }

    hasLoadedRef.current = true;
  }, [setPaystubData, setSelectedState]);

  // Auto-save form data when it changes (after initial load)
  useEffect(() => {
    // Skip initial mount and wait for load to complete
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    // Don't save until initial load is complete
    if (!hasLoadedRef.current) {
      return;
    }

    // Only save if there's meaningful data
    const hasData = paystubData.employeeName || paystubData.hourlyRate || paystubData.hoursPerPeriod;
    if (!hasData) {
      return;
    }

    saveFormData({
      employeeName: paystubData.employeeName,
      employeeId: paystubData.employeeId,
      employerName: paystubData.employerName,
      hourlyRate: paystubData.hourlyRate,
      hoursPerPeriod: paystubData.hoursPerPeriod,
      filingStatus: paystubData.filingStatus,
      taxYear: paystubData.taxYear,
      state: selectedState,
    });
  }, [
    paystubData.employeeName,
    paystubData.employeeId,
    paystubData.employerName,
    paystubData.hourlyRate,
    paystubData.hoursPerPeriod,
    paystubData.filingStatus,
    paystubData.taxYear,
    selectedState,
  ]);

  const clearForm = useCallback(() => {
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
  }, [paystubData.employeeName, paystubData.hourlyRate, paystubData.hoursPerPeriod]);

  return {
    clearForm,
  };
}
