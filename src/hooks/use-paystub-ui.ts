import { useState } from "react";

export function usePaystubUI() {
  const [resultsVisible, setResultsVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [documentType, setDocumentType] = useState<"form" | "paystub" | "annual">("form");

  const handlePrint = () => {
    window.print();
  };

  const backToForm = () => {
    setDocumentType("form");
  };

  const resetUI = () => {
    setResultsVisible(false);
    setSelectedPeriod(1);
    setDocumentType("form");
  };

  return {
    resultsVisible,
    setResultsVisible,
    selectedPeriod,
    setSelectedPeriod,
    documentType,
    setDocumentType,
    handlePrint,
    backToForm,
    resetUI,
  };
}
