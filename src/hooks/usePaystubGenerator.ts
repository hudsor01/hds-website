"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type {
  PaystubData,
  PayPeriod,
  FilingStatus,
  TaxData,
} from "@/types/paystub";
import type { FormErrors } from "@/types/common";
// import { getPayDatesForYear } from "@/lib/paystub-utils";
import {
  calculateFederalTax,
  calculateSocialSecurity,
  calculateMedicare,
} from "@/lib/tax-calculations";
import { saveFormData, loadFormData, clearFormData } from "@/lib/storage";
import { validateForm } from "@/lib/validation";
import { logger } from '@/lib/logger';

export function usePaystubGenerator() {
  const [paystubData, setPaystubData] = useState<PaystubData>({
    employeeName: "",
    employeeId: "",
    employerName: "",
    hourlyRate: 0,
    hoursPerPeriod: 0,
    filingStatus: "single",
    taxYear: 2024,
    payPeriods: [],
    totals: {
      hours: 0,
      grossPay: 0,
      federalTax: 0,
      socialSecurity: 0,
      medicare: 0,
      otherDeductions: 0,
      netPay: 0,
    },
  });

  const [selectedState, setSelectedState] = useState<string>("");
  const [resultsVisible, setResultsVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [documentType, setDocumentType] = useState<
    "form" | "paystub" | "annual"
  >("form");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Load saved form data on mount
  useEffect(() => {
    const savedData = loadFormData();
    if (savedData) {
      logger.info('Paystub form data restored from previous session', {
        component: 'usePaystubGenerator',
        userFlow: 'paystub_tool_usage',
        action: 'form_data_restored',
        businessValue: 'medium',
        restoredFields: {
          employeeName: !!savedData.employeeName,
          employeeId: !!savedData.employeeId,
          employerName: !!savedData.employerName,
          hourlyRate: !!savedData.hourlyRate,
          hoursPerPeriod: !!savedData.hoursPerPeriod,
          state: !!savedData.state,
          taxYear: savedData.taxYear
        }
      })

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
    }
  }, []);

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
    if (
      paystubData.employeeName ||
      paystubData.hourlyRate ||
      paystubData.hoursPerPeriod
    ) {
      saveCurrentFormData();
    }
  }, [paystubData, selectedState, saveCurrentFormData]);

  // Clear form function
  const handleClearForm = () => {
    logger.info('Paystub form cleared by user', {
      component: 'usePaystubGenerator',
      userFlow: 'paystub_tool_usage',
      action: 'form_cleared',
      businessValue: 'low',
      hadData: !!(paystubData.employeeName || paystubData.hourlyRate || paystubData.hoursPerPeriod),
      hadResults: resultsVisible
    })

    setPaystubData({
      employeeName: "",
      employeeId: "",
      employerName: "",
      hourlyRate: 0,
      hoursPerPeriod: 0,
      filingStatus: "single",
      taxYear: 2024,
      payPeriods: [],
      totals: {
        hours: 0,
        grossPay: 0,
        federalTax: 0,
        socialSecurity: 0,
        medicare: 0,
        otherDeductions: 0,
        netPay: 0,
      },
    });
    setSelectedState("");
    setResultsVisible(false);
    setFormErrors({});
    setDocumentType("form");
    clearFormData();
    toast.success("Form cleared successfully");

    // Focus first input
    setTimeout(() => {
      const firstInput = document.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      if (firstInput) {firstInput.focus();}
    }, 100);
  };

  const generatePaystubs = () => {
    // Track paystub generation attempt for business analytics
    logger.info('Paystub generation initiated', {
      component: 'usePaystubGenerator',
      userFlow: 'paystub_tool_usage',
      action: 'generate_attempt',
      businessValue: 'medium',
      toolUsage: {
        hourlyRate: paystubData.hourlyRate,
        hoursPerPeriod: paystubData.hoursPerPeriod,
        filingStatus: paystubData.filingStatus,
        taxYear: paystubData.taxYear
      }
    })

    // Validate form
    const validation = validateForm({
      employeeName: paystubData.employeeName,
      hourlyRate: paystubData.hourlyRate,
      hoursPerPeriod: paystubData.hoursPerPeriod,
    });

    setFormErrors(validation.errors);

    if (!validation.isValid) {
      logger.warn('Paystub generation blocked by validation errors', {
        component: 'usePaystubGenerator',
        userFlow: 'paystub_tool_usage',
        validationErrors: validation.errors,
        action: 'validation_failed'
      })
      toast.error(
        "Please fix the form errors before generating payroll records"
      );
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading("Generating payroll records...");

    try {
      const grossPay = paystubData.hourlyRate * paystubData.hoursPerPeriod;
      // Generate pay dates (simplified for now)
      const payDates: Date[] = [];
      const annualGross = grossPay * 26;

      const totals = {
        hours: 0,
        grossPay: 0,
        federalTax: 0,
        socialSecurity: 0,
        medicare: 0,
        otherDeductions: 0,
        netPay: 0,
      };

      const newPayPeriods: PayPeriod[] = [];

      for (let i = 0; i < 26; i++) {
        const ytdGross = grossPay * i;

        const federalTax = calculateFederalTax(
          grossPay,
          paystubData.filingStatus as keyof TaxData["federalBrackets"],
          annualGross,
          paystubData.taxYear
        );
        const socialSecurity = calculateSocialSecurity(
          grossPay,
          ytdGross,
          paystubData.taxYear
        );
        const medicare = calculateMedicare(
          grossPay,
          ytdGross,
          paystubData.filingStatus as keyof TaxData["additionalMedicareThreshold"],
          paystubData.taxYear
        );
        const otherDeductions = 0;

        const netPay =
          grossPay - federalTax - socialSecurity - medicare - otherDeductions;

        const payPeriod: PayPeriod = {
          period: i + 1,
          payDate: payDates[i]?.toISOString() || "",
          hours: paystubData.hoursPerPeriod,
          grossPay,
          federalTax,
          socialSecurity,
          medicare,
          otherDeductions,
          netPay,
        };

        newPayPeriods.push(payPeriod);

        totals.hours += paystubData.hoursPerPeriod;
        totals.grossPay += grossPay;
        totals.federalTax += federalTax;
        totals.socialSecurity += socialSecurity;
        totals.medicare += medicare;
        totals.otherDeductions += otherDeductions;
        totals.netPay += netPay;
      }

      setPaystubData((prev) => ({
        ...prev,
        payPeriods: newPayPeriods,
        totals,
      }));

      // Track successful paystub generation with performance metrics
      logger.info('Paystub generation completed successfully', {
        component: 'usePaystubGenerator',
        userFlow: 'paystub_tool_usage',
        action: 'generation_success',
        businessValue: 'high',
        toolUsage: {
          payPeriodsGenerated: newPayPeriods.length,
          totalGrossPay: totals.grossPay,
          totalNetPay: totals.netPay,
          averageHourlyRate: paystubData.hourlyRate,
          taxYear: paystubData.taxYear
        },
        performance: {
          processedPayPeriods: 26,
          calculationsPerformed: 26 * 4 // Federal, SS, Medicare, Net for each period
        }
      })

      toast.dismiss(loadingToast);
      toast.success("Pay stubs generated successfully!");
      setResultsVisible(true);
      setDocumentType("paystub");
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to generate pay stubs. Please try again.");
      logger.error("Paystub generation failed", {
        error,
        component: 'usePaystubGenerator',
        action: 'generatePaystubs',
        userFlow: 'paystub_tool_usage',
        formData: {
          employeeName: paystubData.employeeName,
          hourlyRate: paystubData.hourlyRate,
          hoursPerPeriod: paystubData.hoursPerPeriod,
          filingStatus: paystubData.filingStatus,
          taxYear: paystubData.taxYear
        }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const backToForm = () => {
    setDocumentType("form");
  };

  return {
    paystubData,
    setPaystubData,
    selectedState,
    setSelectedState,
    resultsVisible,
    selectedPeriod,
    setSelectedPeriod,
    documentType,
    setDocumentType,
    formErrors,
    isGenerating,
    handleClearForm,
    generatePaystubs,
    handlePrint,
    backToForm,
  };
}
