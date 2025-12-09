import { useState } from "react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { usePaystubCalculator } from "@/hooks/use-paystub-calculator";
import type { PaystubData, PayFrequency } from "@/types/paystub";

interface UsePaystubCalculationsProps {
  paystubData: PaystubData;
  selectedState: string;
  payFrequency: PayFrequency;
  overtimeHours: number;
  overtimeRate: number;
  additionalDeductions: Array<{ name: string; amount: number }>;
  setPaystubData: React.Dispatch<React.SetStateAction<PaystubData>>;
  setResultsVisible: (visible: boolean) => void;
  setDocumentType: (type: "form" | "paystub" | "annual") => void;
  setSelectedPeriod: (period: number) => void;
}

export function usePaystubCalculations({
  paystubData,
  selectedState,
  payFrequency,
  overtimeHours,
  overtimeRate,
  additionalDeductions,
  setPaystubData,
  setResultsVisible,
  setDocumentType,
  setSelectedPeriod,
}: UsePaystubCalculationsProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Use the modern reactive hook for calculations
  const { calculationResult, hasErrors } = usePaystubCalculator({
    hourlyRate: paystubData.hourlyRate,
    hoursPerPeriod: paystubData.hoursPerPeriod,
    filingStatus: paystubData.filingStatus,
    taxYear: paystubData.taxYear,
    state: selectedState || "TX",
    payFrequency,
    overtimeHours,
    overtimeRate: overtimeRate || paystubData.hourlyRate * 1.5,
    additionalDeductions,
  });

  const generatePaystubs = () => {
    logger.info("Paystub generation initiated", {
      component: "usePaystubCalculations",
      userFlow: "paystub_tool_usage",
      action: "generate_attempt",
      businessValue: "medium",
      toolUsage: {
        hourlyRate: paystubData.hourlyRate,
        hoursPerPeriod: paystubData.hoursPerPeriod,
        filingStatus: paystubData.filingStatus,
        taxYear: paystubData.taxYear,
      },
    });

    setIsGenerating(true);
    const loadingToast = toast.loading("Generating payroll records...");

    try {
      if (hasErrors || !calculationResult) {
        throw new Error("Invalid input parameters");
      }

      // Commit the calculated results to state
      setPaystubData((prev) => ({
        ...prev,
        payPeriods: calculationResult.payPeriods,
        totals: calculationResult.totals,
      }));

      setResultsVisible(true);
      setDocumentType("form");
      setSelectedPeriod(1);

      toast.success("Payroll records generated successfully!");

      logger.info("Payroll generation completed successfully", {
        component: "usePaystubCalculations",
        userFlow: "paystub_tool_usage",
        action: "generation_completed",
        businessValue: "high",
        toolUsage: {
          payPeriodsGenerated: calculationResult.payPeriods.length,
          hasEmployeeName: !!paystubData.employeeName,
          hasEmployeeId: !!paystubData.employeeId,
          hasEmployerName: !!paystubData.employerName,
          state: selectedState || "none_selected",
          payFrequency,
          totalGrossPay: calculationResult.totals.grossPay,
          totalNetPay: calculationResult.totals.netPay,
          totalStateTax: calculationResult.totals.stateTax,
        },
      });
    } catch (error) {
      toast.error("Failed to generate payroll records. Please check your input values.");
      logger.error("Payroll generation failed", {
        error,
        component: "usePaystubCalculations",
        action: "generatePaystubs",
        userFlow: "paystub_tool_usage",
        formData: {
          hasEmployeeName: !!paystubData.employeeName,
          hourlyRate: paystubData.hourlyRate,
          hoursPerPeriod: paystubData.hoursPerPeriod,
          filingStatus: paystubData.filingStatus,
          taxYear: paystubData.taxYear,
          selectedState,
        },
      });
    } finally {
      toast.dismiss(loadingToast);
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generatePaystubs,
  };
}
