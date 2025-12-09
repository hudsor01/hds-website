import { useState } from "react";
import type { PaystubData, PayFrequency } from "@/types/paystub";

const DEFAULT_PAY_FREQUENCY: PayFrequency = "biweekly";

const INITIAL_PAYSTUB: PaystubData = {
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
    stateTax: 0,
    otherDeductions: 0,
    netPay: 0,
  },
};

export function usePaystubForm() {
  const [paystubData, setPaystubDataState] = useState<PaystubData>(INITIAL_PAYSTUB);
  const [selectedState, setSelectedState] = useState<string>("");
  const [payFrequency, setPayFrequency] = useState<PayFrequency>(DEFAULT_PAY_FREQUENCY);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [overtimeRate, setOvertimeRate] = useState<number>(0);
  const [additionalDeductions, setAdditionalDeductions] = useState<Array<{ name: string; amount: number }>>([]);

  const setPaystubData = (update: Partial<PaystubData> | ((prev: PaystubData) => PaystubData)) => {
    setPaystubDataState((prev) =>
      typeof update === "function" ? (update as (prev: PaystubData) => PaystubData)(prev) : { ...prev, ...update }
    );
  };

  const resetForm = () => {
    setPaystubDataState(INITIAL_PAYSTUB);
    setSelectedState("");
    setPayFrequency(DEFAULT_PAY_FREQUENCY);
    setOvertimeHours(0);
    setOvertimeRate(0);
    setAdditionalDeductions([]);
  };

  return {
    paystubData,
    setPaystubData,
    selectedState,
    setSelectedState,
    payFrequency,
    setPayFrequency,
    overtimeHours,
    setOvertimeHours,
    overtimeRate,
    setOvertimeRate,
    additionalDeductions,
    setAdditionalDeductions,
    resetForm,
  };
}
