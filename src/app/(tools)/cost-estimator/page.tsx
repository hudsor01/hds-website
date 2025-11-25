/**
 * Website Cost Estimator
 * Helps prospects understand project costs based on requirements
 */

'use client';

import { useState } from 'react';
import { CalculatorLayout } from '@/components/calculators/CalculatorLayout';
import { CalculatorInput } from '@/components/calculators/CalculatorInput';
import { CalculatorResults } from '@/components/calculators/CalculatorResults';
import { trackEvent } from '@/lib/analytics';

interface CalculatorInputs {
  websiteType: string;
  numberOfPages: number;
  features: string[];
  designComplexity: string;
  timeline: string;
  maintenanceNeeded: boolean;
}

export default function CostEstimatorPage() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    websiteType: '',
    numberOfPages: 5,
    features: [],
    designComplexity: 'standard',
    timeline: 'normal',
    maintenanceNeeded: false,
  });

  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Record<string, string>>({});

  const websiteTypes = [
    { value: 'landing-page', label: 'Landing Page', basePrice: 2000 },
    { value: 'business-website', label: 'Business Website', basePrice: 5000 },
    { value: 'e-commerce', label: 'E-Commerce Store', basePrice: 10000 },
    { value: 'web-app', label: 'Web Application', basePrice: 15000 },
    { value: 'enterprise', label: 'Enterprise Solution', basePrice: 30000 },
  ];

  const availableFeatures = [
    { value: 'blog', label: 'Blog/News Section', price: 1500 },
    { value: 'contact-forms', label: 'Advanced Contact Forms', price: 800 },
    { value: 'payment', label: 'Payment Processing', price: 3000 },
    { value: 'user-auth', label: 'User Authentication', price: 2500 },
    { value: 'booking', label: 'Booking System', price: 3500 },
    { value: 'membership', label: 'Membership Area', price: 4000 },
    { value: 'analytics', label: 'Advanced Analytics', price: 1200 },
    { value: 'multilingual', label: 'Multi-language Support', price: 2000 },
    { value: 'api-integration', label: 'Third-party API Integration', price: 2500 },
    { value: 'custom-dashboard', label: 'Custom Dashboard', price: 5000 },
  ];

  const handleFeatureToggle = (feature: string) => {
    setInputs(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const calculateCost = () => {
    // Base price from website type
    const selectedType = websiteTypes.find(t => t.value === inputs.websiteType);
    let totalCost = selectedType?.basePrice || 0;

    // Add cost per page (after first 5 pages)
    const extraPages = Math.max(0, inputs.numberOfPages - 5);
    totalCost += extraPages * 500;

    // Add feature costs
    inputs.features.forEach(feature => {
      const featureData = availableFeatures.find(f => f.value === feature);
      if (featureData) {
        totalCost += featureData.price;
      }
    });

    // Design complexity multiplier
    const designMultipliers: Record<string, number> = {
      'basic': 0.8,
      'standard': 1.0,
      'custom': 1.3,
      'premium': 1.6,
    };
    totalCost *= designMultipliers[inputs.designComplexity] || 1.0;

    // Timeline adjustment
    if (inputs.timeline === 'urgent') {
      totalCost *= 1.25; // 25% rush fee
    }

    // Maintenance package (annual)
    const maintenanceCost = inputs.maintenanceNeeded ? totalCost * 0.15 : 0;

    // Calculate ranges (±20%)
    const lowEstimate = Math.round(totalCost * 0.8);
    const highEstimate = Math.round(totalCost * 1.2);
    const avgEstimate = Math.round(totalCost);

    // Timeline estimate (weeks)
    let timelineWeeks = 4;
    if (inputs.websiteType === 'e-commerce') {timelineWeeks = 8;}
    if (inputs.websiteType === 'web-app') {timelineWeeks = 12;}
    if (inputs.websiteType === 'enterprise') {timelineWeeks = 16;}
    timelineWeeks += inputs.features.length;
    if (inputs.timeline === 'urgent') {timelineWeeks = Math.ceil(timelineWeeks * 0.7);}

    const calculatedResults = {
      estimatedCost: `$${lowEstimate.toLocaleString()} - $${highEstimate.toLocaleString()}`,
      averageCost: `$${avgEstimate.toLocaleString()}`,
      timeline: `${timelineWeeks} weeks`,
      monthlyMaintenance: inputs.maintenanceNeeded
        ? `$${Math.round(maintenanceCost / 12).toLocaleString()}/mo`
        : 'Not included',
      annualMaintenance: inputs.maintenanceNeeded
        ? `$${Math.round(maintenanceCost).toLocaleString()}/year`
        : 'Not included',
    };

    setResults(calculatedResults);
    setShowResults(true);

    // Track calculator usage
    trackEvent('calculator_used', {
      calculator_type: 'cost-estimator',
      website_type: inputs.websiteType,
      estimated_cost: avgEstimate,
      features_count: inputs.features.length,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateCost();
  };

  const resultItems = [
    {
      label: 'Estimated Cost Range',
      value: results.estimatedCost || '$0',
      description: 'Based on your project requirements',
      highlight: true,
    },
    {
      label: 'Average Estimate',
      value: results.averageCost || '$0',
      description: 'Most likely final cost',
    },
    {
      label: 'Estimated Timeline',
      value: results.timeline || '0 weeks',
      description: 'From kickoff to launch',
    },
    {
      label: 'Monthly Maintenance',
      value: results.monthlyMaintenance || 'Not included',
      description: 'Optional ongoing support & updates',
    },
  ];

  return (
    <CalculatorLayout
      title="Website Cost Estimator"
      description="Get an instant estimate for your website project based on your specific requirements"
      icon={
        <svg className="h-8 w-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      }
    >
      {!showResults ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Website Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-muted-foreground dark:text-muted">
              Website Type *
            </label>
            <select
              value={inputs.websiteType}
              onChange={(e) => setInputs(prev => ({ ...prev, websiteType: e.target.value }))}
              required
              className="block w-full rounded-md border-border shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-muted dark:text-white"
            >
              <option value="">Select a type...</option>
              {websiteTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} (from ${type.basePrice.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Number of Pages */}
          <CalculatorInput
            label="Number of Pages"
            id="numberOfPages"
            type="number"
            min="1"
            max="100"
            step="1"
            value={inputs.numberOfPages || ''}
            onChange={(e) => setInputs(prev => ({ ...prev, numberOfPages: parseInt(e.target.value) || 1 }))}
            helpText="Estimated number of unique pages"
            required
          />

          {/* Features */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-muted-foreground dark:text-muted">
              Additional Features
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {availableFeatures.map(feature => (
                <label
                  key={feature.value}
                  className="relative flex cursor-pointer items-start rounded-lg border border-border p-4 hover:bg-muted dark:border-gray-600 dark:hover:bg-muted"
                >
                  <div className="flex h-5 items-center">
                    <input
                      type="checkbox"
                      checked={inputs.features.includes(feature.value)}
                      onChange={() => handleFeatureToggle(feature.value)}
                      className="h-4 w-4 rounded border-border text-cyan-600 focus:ring-cyan-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <div className="font-medium text-foreground dark:text-white">
                      {feature.label}
                    </div>
                    <div className="text-muted-foreground dark:text-muted-foreground">
                      +${feature.price.toLocaleString()}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Design Complexity */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-muted-foreground dark:text-muted">
              Design Complexity
            </label>
            <select
              value={inputs.designComplexity}
              onChange={(e) => setInputs(prev => ({ ...prev, designComplexity: e.target.value }))}
              className="block w-full rounded-md border-border shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-muted dark:text-white"
            >
              <option value="basic">Basic Template (-20%)</option>
              <option value="standard">Standard Custom Design</option>
              <option value="custom">Fully Custom Design (+30%)</option>
              <option value="premium">Premium/Luxury Design (+60%)</option>
            </select>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-muted-foreground dark:text-muted">
              Project Timeline
            </label>
            <select
              value={inputs.timeline}
              onChange={(e) => setInputs(prev => ({ ...prev, timeline: e.target.value }))}
              className="block w-full rounded-md border-border shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-muted dark:text-white"
            >
              <option value="flexible">Flexible (Best Price)</option>
              <option value="normal">Normal (4-12 weeks)</option>
              <option value="urgent">Urgent (+25% Rush Fee)</option>
            </select>
          </div>

          {/* Maintenance */}
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="maintenance"
                type="checkbox"
                checked={inputs.maintenanceNeeded}
                onChange={(e) => setInputs(prev => ({ ...prev, maintenanceNeeded: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-cyan-600 focus:ring-cyan-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="maintenance" className="font-medium text-muted-foreground dark:text-muted">
                Include Maintenance Package
              </label>
              <p className="text-muted-foreground dark:text-muted-foreground">
                Ongoing updates, security patches, and technical support
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!inputs.websiteType}
            className="w-full rounded-md bg-cyan-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Calculate Estimate
          </button>
        </form>
      ) : (
        <div>
          <CalculatorResults
            results={resultItems}
            calculatorType="cost-estimator"
            inputs={inputs}
          />

          <button
            onClick={() => setShowResults(false)}
            className="mt-6 w-full rounded-md border border-border bg-white px-6 py-3 text-base font-semibold text-muted-foreground shadow-sm hover:bg-muted dark:border-gray-600 dark:bg-muted dark:text-muted dark:hover:bg-gray-600"
          >
            ← Modify Estimate
          </button>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              This is an estimate only. Final pricing may vary based on specific requirements, complexity, and project scope. Contact us for a detailed quote.
            </p>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
