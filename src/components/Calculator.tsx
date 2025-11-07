"use client";

import DOMPurify from 'dompurify'
import { Car } from 'lucide-react'
import Head from 'next/head'
import { useState } from 'react'
import { useCalculator } from '../providers/CalculatorProvider'
import type { PaymentResults, TTLResults, VehicleInputs } from '../types/ttl-types'
import { ComparisonView } from './ComparisonView'
import { InputPanel } from './InputPanel/InputPanel'
import { ResultsPanel } from './ResultsPanel'

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

  const handleSaveCalculation = async () => {
    try {
      await saveCurrentCalculation();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save calculation:', error);
    }
 };

  const handleEmailResults = () => {
    const subject = encodeURIComponent('Texas TTL Calculator Results');
    const body = encodeURIComponent(`
Texas TTL Calculator Results

Vehicle Information:
- Purchase Price: $${DOMPurify.sanitize((vehicleInput.purchasePrice || 0).toFixed(2))}
- Down Payment: $${DOMPurify.sanitize((vehicleInput.downPayment || 0).toFixed(2))}
- Trade-In Value: $${DOMPurify.sanitize((vehicleInput.tradeInValue || 0).toFixed(2))}
- County: ${DOMPurify.sanitize(vehicleInput.county || '')}

TTL Breakdown:
- Sales Tax (6.25%): $${DOMPurify.sanitize((calculationResults?.ttlResults?.salesTax || 0).toFixed(2))}
- Title & Local Fees: $${DOMPurify.sanitize((calculationResults?.ttlResults?.titleFee || 0).toFixed(2))}
- Registration: $${DOMPurify.sanitize((calculationResults?.ttlResults?.registrationFees || 0).toFixed(2))}
${calculationResults?.ttlResults?.evFee && calculationResults?.ttlResults?.evFee > 0 ? `- EV Fee: $${DOMPurify.sanitize(calculationResults?.ttlResults?.evFee.toFixed(2))}\n` : ''}
${calculationResults?.ttlResults?.emissions && calculationResults?.ttlResults?.emissions > 0 ? `- Emissions: $${DOMPurify.sanitize(calculationResults?.ttlResults?.emissions.toFixed(2))}\n` : ''}
- Total TTL: $${DOMPurify.sanitize((calculationResults?.ttlResults?.totalTTL || 0).toFixed(2))}

Monthly Payment:
- Loan Amount: $${DOMPurify.sanitize((calculationResults?.paymentResults?.loanAmount || 0).toFixed(2))}
- Term: ${DOMPurify.sanitize(vehicleInput.loanTermMonths.toString())} months
- Interest Rate: ${DOMPurify.sanitize(vehicleInput.interestRate.toString())}% APR
- Monthly Payment: $${DOMPurify.sanitize((calculationResults?.paymentResults?.monthlyPayment || 0).toFixed(2))}
- Total Interest: $${DOMPurify.sanitize((calculationResults?.paymentResults?.totalInterest || 0).toFixed(2))}
- Total Amount Financed: $${DOMPurify.sanitize((calculationResults?.paymentResults?.totalFinanced || 0).toFixed(2))}
    `);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShareLink = () => {
    const params = new URLSearchParams();
    Object.entries(vehicleInput).forEach(([key, value]) => {
      params.append(key, value.toString());
    });

    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    navigator.clipboard.writeText(shareableUrl)
      .then(() => {
        alert('Shareable link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
        prompt('Copy this link to share your calculation:', shareableUrl);
      });
  };

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the calculation');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Texas TTL Calculator - Results</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #33;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #2563eb;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10px;
          }
          h2 {
            color: #4b5563;
            margin-top: 20px;
          }
          .section {
            margin-bottom: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            text-align: left;
            padding: 8px;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f1f5f9;
          }
          .total {
            font-weight: bold;
            font-size: 1.2em;
            color: #2563eb;
          }
          .footer {
            margin-top: 40px;
            font-size: 0.8em;
            color: #6b7280;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          @media print {
            body {
              padding: 0;
              margin: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right; margin-bottom: 20px;">
          <button onclick="window.print()">Print PDF</button>
        </div>

        <h1>Texas TTL Calculator - Results</h1>

        <div class="section">
          <h2>Vehicle Information</h2>
          <table>
            <tr>
              <th>Purchase Price</th>
              <td>$${DOMPurify.sanitize((vehicleInput.purchasePrice || 0).toFixed(2))}</td>
            </tr>
            <tr>
              <th>Down Payment</th>
              <td>$${DOMPurify.sanitize((vehicleInput.downPayment || 0).toFixed(2))}</td>
            </tr>
            <tr>
              <th>Trade-In Value</th>
              <td>$${DOMPurify.sanitize((vehicleInput.tradeInValue || 0).toFixed(2))}</td>
            </tr>
            <tr>
              <th>County</th>
              <td>${DOMPurify.sanitize(vehicleInput.county || '')}</td>
            </tr>
            <tr>
              <th>Vehicle Type</th>
              <td>${DOMPurify.sanitize(vehicleInput.isNewVehicle ? 'New' : 'Used')} ${DOMPurify.sanitize(vehicleInput.isElectric ? 'Electric' : '')} Vehicle</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h2>TTL Breakdown</h2>
          <table>
            <tr>
              <th>Sales Tax (6.25%)</th>
              <td>$${DOMPurify.sanitize((calculationResults?.ttlResults?.salesTax || 0).toFixed(2))}</td>
            </tr>
            <tr>
              <th>Title & Local Fees</th>
              <td>$${DOMPurify.sanitize((calculationResults?.ttlResults?.titleFee || 0).toFixed(2))}</td>
            </tr>
            <tr>
              <th>Registration</th>
              <td>$${DOMPurify.sanitize((calculationResults?.ttlResults?.registrationFees || 0).toFixed(2))}</td>
            </tr>
            ${calculationResults?.ttlResults?.evFee && calculationResults?.ttlResults?.evFee > 0 ? `
            <tr>
              <th>EV Fee</th>
              <td>$${DOMPurify.sanitize(calculationResults?.ttlResults?.evFee.toFixed(2))}</td>
            </tr>` : ''}
            ${calculationResults?.ttlResults?.emissions && calculationResults?.ttlResults?.emissions > 0 ? `
            <tr>
              <th>Emissions</th>
              <td>$${DOMPurify.sanitize(calculationResults?.ttlResults?.emissions.toFixed(2))}</td>
            </tr>` : ''}
            <tr>
              <th>Total TTL</th>
              <td class="total">$${DOMPurify.sanitize((calculationResults?.ttlResults?.totalTTL || 0).toFixed(2))}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h2>Monthly Payment</h2>
          <table>
            <tr>
              <th>Loan Amount</th>
              <td>$${DOMPurify.sanitize((calculationResults?.paymentResults?.loanAmount || 0).toFixed(2))}</td>
            </tr>
            <tr>
              <th>Term</th>
              <td>${DOMPurify.sanitize((vehicleInput.loanTermMonths || 0).toString())} months</td>
            </tr>
            <tr>
              <th>Interest Rate</th>
              <td>${DOMPurify.sanitize((vehicleInput.interestRate || 0).toString())}% APR</td>
            </tr>
            <tr>
              <th>Monthly Payment</th>
              <td class="total">$${DOMPurify.sanitize((calculationResults?.paymentResults?.monthlyPayment || 0).toFixed(2))}</td>
            </tr>
            <tr>
              <th>Total Interest</th>
              <td>$${DOMPurify.sanitize((calculationResults?.paymentResults?.totalInterest || 0).toFixed(2))}</td>
            </tr>
            <tr>
              <th>Total Amount Financed</th>
              <td>$${DOMPurify.sanitize((calculationResults?.paymentResults?.totalFinanced || 0).toFixed(2))}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Generated on ${DOMPurify.sanitize(new Date().toLocaleDateString())} by Texas TTL Calculator</p>
          <p>Note: This calculator provides estimates based on Texas state fees and regulations. Actual fees may vary by county and specific circumstances. Always verify with your local Texas DMV office.</p>
        </div>
      </body>
      </html>
    `;

    // Sanitize the entire content before writing
    const sanitizedContent = DOMPurify.sanitize(printContent, {
      ALLOWED_TAGS: ['!doctype', 'html', 'head', 'title', 'style', 'body', 'div', 'h1', 'h2', 'table', 'tr', 'th', 'td', 'button', 'p'],
      ALLOWED_ATTR: ['class', 'style', 'onclick', 'type', 'rel']
    });

    printWindow.document.open();
    printWindow.document.write(sanitizedContent);
    printWindow.document.close();

    printWindow.onload = function() {
      setTimeout(() => {
        {return;}      }, 500);
    };
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-8 px-4">
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
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
            })
          }}
        />
      </Head>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Car className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-gray-900">Texas TTL Calculator</h1>
          </div>
          <p className="text-gray-600">Tax, Title, License & Payment Calculator for Texas Vehicles</p>
        </div>

        {comparisonMode && (
          <ComparisonView
            comparisonVehicles={comparisonVehicles}
            removeFromComparison={removeFromComparison}
            clearComparison={clearComparison}
            setComparisonMode={setComparisonMode}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Disclaimer: This calculator provides estimates based on Texas state fees and regulations. Actual fees may vary.</p>
          <p>Always verify with your local Texas DMV office for the most accurate information.</p>
        </div>
      </div>
    </div>
  );
}
