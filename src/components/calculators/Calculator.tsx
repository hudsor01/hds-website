"use client";

import { emailResults, saveCalculation } from '@/app/actions/ttl-calculator';
import { JsonLd } from '@/components/JsonLd';
import { logger } from '@/lib/logger';
import { Car, Copy, Mail, Printer, Share2 } from 'lucide-react';
import Head from 'next/head';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useCalculator } from '../../providers/CalculatorProvider';
import type { PaymentResults, TTLResults, VehicleInputs } from '../../types/ttl-types';
import { ComparisonView } from '../ComparisonView';
import { InputPanel } from '../InputPanel/InputPanel';
import { ResultsPanel } from '../ResultsPanel';

export function Calculator() {
  const {
    vehicleInput,
    calculationResults,
    isLoading,
    error,
    updateInput,
    saveCurrentCalculation  } = useCalculator();

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonVehicles, setComparisonVehicles] = useState<Array<{
    input: VehicleInputs;
    ttl: TTLResults;
    payment: PaymentResults;
    name: string;
  }>>([]);

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSaveCalculation = async () => {
    try {
      await saveCurrentCalculation();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      logger.error('Failed to save calculation', error as Error);
    }
 };

  const handleEmailResults = async () => {
    if (!shareCode) {
      // First save to get a share code
      await handleShareLink();
      return;
    }

    if (!emailInput || !emailInput.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    startTransition(async () => {
      const result = await emailResults(shareCode, emailInput);
      if (result.success) {
        toast.success('Results sent to your email!');
        setEmailInput('');
      } else {
        toast.error(result.error || 'Failed to send email');
      }
    });
  };

  const handleShareLink = async () => {
    if (!calculationResults) {
      toast.error('No calculation results to share');
      return;
    }

    startTransition(async () => {
      const result = await saveCalculation(vehicleInput, calculationResults);

      if (result.success && result.shareCode) {
        setShareCode(result.shareCode);
        setShowShareModal(true);

        const shareableUrl = `${window.location.origin}${window.location.pathname}?c=${result.shareCode}`;

        try {
          await navigator.clipboard.writeText(shareableUrl);
          toast.success('Link copied to clipboard!');
        } catch {
          // Clipboard failed, modal will show the link
          logger.info('Clipboard API not available');
        }
      } else {
        toast.error(result.error || 'Failed to create share link');
      }
    });
  };

  const copyShareLink = async () => {
    if (!shareCode) {return;}
    const shareableUrl = `${window.location.origin}${window.location.pathname}?c=${shareCode}`;
    try {
      await navigator.clipboard.writeText(shareableUrl);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handlePrintPDF = () => {
    // Uses CSS @media print styles from print.css
    window.print();
  };

  const addToComparison = () => {
    if (comparisonVehicles.length >= 3) {return;} // Limit to 3 vehicles

    // Create a name for the vehicle based on price and county
    const vehicleName = `$${vehicleInput.purchasePrice.toLocaleString()} - ${vehicleInput.county}`;

    setComparisonVehicles(prev => [
      ...prev,
      {
        input: {...vehicleInput},
        ttl: {
          salesTax: calculationResults?.ttlResults?.salesTax ?? 0,
          titleFee: calculationResults?.ttlResults?.titleFee ?? 0,
          registrationFees: calculationResults?.ttlResults?.registrationFees ?? 0,
          processingFees: calculationResults?.ttlResults?.processingFees ?? 0,
          evFee: calculationResults?.ttlResults?.evFee ?? 0,
          emissions: calculationResults?.ttlResults?.emissions ?? 0,
          totalTTL: calculationResults?.ttlResults?.totalTTL ?? 0
        },
        payment: {
          loanAmount: calculationResults?.paymentResults?.loanAmount ?? 0,
          monthlyPayment: calculationResults?.paymentResults?.monthlyPayment ?? 0,
          biweeklyPayment: calculationResults?.paymentResults?.biweeklyPayment ?? 0,
          totalInterest: calculationResults?.paymentResults?.totalInterest ?? 0,
          totalFinanced: calculationResults?.paymentResults?.totalFinanced ?? 0
        },
        name: vehicleName
      }
    ]);

    setComparisonMode(true);
 };

  const removeFromComparison = (index: number) => {
    setComparisonVehicles(prev => prev.filter((_, i) => i !== index));

    // If no vehicles left, exit comparison mode
    if (comparisonVehicles.length <= 1) {
      setComparisonMode(false);
    }
  };

 const clearComparison = () => {
    setComparisonVehicles([]);
    setComparisonMode(false);
  };

  return (
    <div className="min-h-screen bg-primary/10 py-8 px-4">
      <Head>
        <title>Texas TTL Calculator - Calculate Vehicle Tax, Title, and License Fees</title>
        <meta name="description" content="Calculate tax, title, license fees and monthly payments for vehicles in Texas. Free online calculator for car buyers and dealers." />
        <meta name="keywords" content="Texas TTL calculator, vehicle tax calculator, car title fees, license fees Texas, auto loan calculator, car payment calculator" />
        <meta property="og:title" content="Texas TTL Calculator" />
        <meta property="og:description" content="Calculate tax, title, license fees and monthly payments for vehicles in Texas" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Texas TTL Calculator" />
        <meta name="twitter:description" content="Calculate tax, title, license fees and monthly payments for vehicles in Texas" />
      </Head>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Texas TTL Calculator",
        "description": "Calculate tax, title, license fees and monthly payments for vehicles in Texas",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      }} />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-comfortable">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Car className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Texas TTL Calculator</h1>
          </div>
          <p className="text-muted-foreground">Tax, Title, License & Payment Calculator for Texas Vehicles</p>
        </div>

        {comparisonMode && (
          <ComparisonView
            comparisonVehicles={comparisonVehicles}
            removeFromComparison={removeFromComparison}
            clearComparison={clearComparison}
            setComparisonMode={setComparisonMode}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-comfortable">
          <div className="lg:col-span-2">
            <InputPanel
              vehicleInput={vehicleInput}
              updateInput={updateInput as (field: string, value: unknown) => void}
              addToComparison={addToComparison}
              comparisonVehicles={comparisonVehicles}
            />
          </div>

          <div className="lg:col-span-1">
            <ResultsPanel
              vehicleInput={vehicleInput}
              calculationResults={calculationResults}
              isLoading={isLoading}
              error={error}
              handleSaveCalculation={handleSaveCalculation}
              saveSuccess={saveSuccess}
              handleEmailResults={handleEmailResults}
              handleShareLink={handleShareLink}
              handlePrintPDF={handlePrintPDF}
              addToComparison={addToComparison}
              comparisonVehicles={comparisonVehicles}
            />
          </div>
        </div>

        {/* Footer with disclaimer */}
        <div className="mt-12 text-center text-sm text-muted-foreground print-footer">
          <p>Disclaimer: This calculator provides estimates based on Texas state fees and regulations. Actual fees may vary.</p>
          <p>Always verify with your local Texas DMV office for the most accurate information.</p>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 no-print" onClick={() => setShowShareModal(false)}>
          <div
            className="bg-card rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <Share2 className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Share Your Results</h2>
            </div>

            {/* Share Link */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Shareable Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareCode ? `${window.location.origin}${window.location.pathname}?c=${shareCode}` : ''}
                  className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm text-foreground border border-border"
                />
                <button
                  onClick={copyShareLink}
                  className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  aria-label="Copy link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">This link will work for 90 days</p>
            </div>

            {/* Email Results */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Email Results
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-background rounded-lg text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  onClick={handleEmailResults}
                  disabled={isPending || !emailInput}
                  className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send email"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Print Button */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setTimeout(handlePrintPDF, 100);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Results
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
