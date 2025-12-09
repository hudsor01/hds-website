import { useState } from "react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { validatePaystubInputs } from "@/lib/paystub-calculator/validation";
import { paystubFormSchema } from "@/lib/schemas/paystub";
import type { FormErrors } from "@/types/common";
import type { PaystubData } from "@/types/paystub";

type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

interface UsePaystubValidationProps {
  paystubData: PaystubData;
  selectedState: string;
  payFrequency: PayFrequency;
  overtimeHours: number;
  overtimeRate: number;
  additionalDeductions: Array<{ name: string; amount: number }>;
}

export function usePaystubValidation({
  paystubData,
  selectedState,
  payFrequency,
  overtimeHours,
  overtimeRate,
  additionalDeductions,
}: UsePaystubValidationProps) {
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const mapZodIssuesToFormErrors = (issues: ReturnType<typeof paystubFormSchema.safeParse>["error"] | undefined) => {
    const errors: FormErrors = {};
    if (!issues) {
      return errors;
    }

    issues.issues.forEach((issue) => {
      const path = issue.path[0];
      if (path === "employeeName" || path === "hourlyRate" || path === "hoursPerPeriod") {
        errors[path] = issue.message;
      }
    });
    return errors;
  };

  const validateForm = () => {
    const baseValidation = paystubFormSchema
      .pick({ employeeName: true, hourlyRate: true, hoursPerPeriod: true })
      .safeParse({
        employeeName: paystubData.employeeName,
        hourlyRate: paystubData.hourlyRate,
        hoursPerPeriod: paystubData.hoursPerPeriod,
      });

    const validationResult = validatePaystubInputs({
      hourlyRate: paystubData.hourlyRate,
      hoursPerPeriod: paystubData.hoursPerPeriod,
      filingStatus: paystubData.filingStatus,
      taxYear: paystubData.taxYear,
      state: selectedState,
      payFrequency,
      overtimeHours,
      overtimeRate: overtimeRate || paystubData.hourlyRate * 1.5,
      additionalDeductions,
    });

    const combinedErrors: FormErrors = {
      ...mapZodIssuesToFormErrors(baseValidation.success ? undefined : baseValidation.error),
    };

    if (!validationResult.isValid) {
      if (validationResult.errors.hourlyRate) {
        combinedErrors.hourlyRate = validationResult.errors.hourlyRate;
      }
      if (validationResult.errors.hoursPerPeriod) {
        combinedErrors.hoursPerPeriod = validationResult.errors.hoursPerPeriod;
      }
      if (validationResult.errors.employeeName) {
        combinedErrors.employeeName = validationResult.errors.employeeName;
      }
    }

    setFormErrors(combinedErrors);

    if (!baseValidation.success || !validationResult.isValid) {
      toast.error("Please fix the form errors before generating payroll records");
      logger.warn("Paystub generation blocked by validation errors", {
        component: "usePaystubValidation",
        userFlow: "paystub_tool_usage",
        validationErrors: { ...combinedErrors, ...validationResult.errors },
        action: "validation_failed",
      });
      return false;
    }

    return true;
  };

  const resetErrors = () => {
    setFormErrors({});
  };

  return {
    formErrors,
    validateForm,
    resetErrors,
  };
}
