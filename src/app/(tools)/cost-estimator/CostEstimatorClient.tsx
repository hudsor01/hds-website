/**
 * Website Cost Estimator Client Component
 * Contains the interactive cost estimation form with URL state management
 */

'use client';

import { CalculatorInput } from '@/components/calculators/CalculatorInput';
import { CalculatorResults } from '@/components/calculators/CalculatorResults';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trackEvent } from '@/lib/analytics';
import { useState } from 'react';
import { useQueryState, parseAsString, parseAsInteger, parseAsBoolean, parseAsArrayOf } from 'nuqs';

interface CalculatorInputs {
  websiteType: string;
  numberOfPages: number;
  features: string[];
  designComplexity: string;
  timeline: string;
  maintenanceNeeded: boolean;
}

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

export function CostEstimatorClient() {
  const [websiteType, setWebsiteType] = useQueryState('type', parseAsString.withDefault(''));
  const [numberOfPages, setNumberOfPages] = useQueryState('pages', parseAsInteger.withDefault(5));
  const [features, setFeatures] = useQueryState('features', parseAsArrayOf(parseAsString).withDefault([]));
  const [designComplexity, setDesignComplexity] = useQueryState('design', parseAsString.withDefault('standard'));
  const [timeline, setTimeline] = useQueryState('timeline', parseAsString.withDefault('normal'));
  const [maintenanceNeeded, setMaintenanceNeeded] = useQueryState('maint', parseAsBoolean.withDefault(false));

  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Record<string, string>>({});

  const inputs: CalculatorInputs = {
    websiteType,
    numberOfPages,
    features,
    designComplexity,
    timeline,
    maintenanceNeeded
  };

  const handleFeatureToggle = (feature: string) => {
    setFeatures(prevFeatures =>
      prevFeatures.includes(feature)
        ? prevFeatures.filter(f => f !== feature)
        : [...prevFeatures, feature]
    );
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

    // Calculate ranges (+-20%)
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
    <>
      {!showResults ? (
        <form onSubmit={handleSubmit} className="space-y-comfortable">
          {/* Website Type */}
          <div className="space-y-tight">
            <Label htmlFor="websiteType">Website Type *</Label>
            <Select
              name="websiteType"
              value={websiteType}
              onValueChange={setWebsiteType}
              required
            >
              <SelectTrigger id="websiteType">
                <SelectValue placeholder="Select a type..." />
              </SelectTrigger>
              <SelectContent>
                {websiteTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label} (from ${type.basePrice.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number of Pages */}
          <CalculatorInput
            label="Number of Pages"
            id="numberOfPages"
            type="number"
            min="1"
            max="100"
            step="1"
            value={numberOfPages || ''}
            onChange={(e) => setNumberOfPages(parseInt(e.target.value) || 1)}
            helpText="Estimated number of unique pages"
            required
          />

          {/* Features */}
          <div className="space-y-tight">
            <Label>Additional Features</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {availableFeatures.map(feature => (
                <label
                  key={feature.value}
                  className="relative flex cursor-pointer items-start rounded-lg border border-border card-padding-sm hover:bg-muted"
                >
                  <div className="flex h-5 items-center">
                    <Checkbox
                      checked={inputs.features.includes(feature.value)}
                      onCheckedChange={() => handleFeatureToggle(feature.value)}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <div className="font-medium text-foreground">
                      {feature.label}
                    </div>
                    <div className="text-muted-foreground">
                      +${feature.price.toLocaleString()}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Design Complexity */}
          <div className="space-y-tight">
            <Label htmlFor="designComplexity">Design Complexity</Label>
            <Select
              name="designComplexity"
              value={designComplexity}
              onValueChange={setDesignComplexity}
            >
              <SelectTrigger id="designComplexity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic Template (-20%)</SelectItem>
                <SelectItem value="standard">Standard Custom Design</SelectItem>
                <SelectItem value="custom">Fully Custom Design (+30%)</SelectItem>
                <SelectItem value="premium">Premium/Luxury Design (+60%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Timeline */}
          <div className="space-y-tight">
            <Label htmlFor="timeline">Project Timeline</Label>
            <Select
              name="timeline"
              value={timeline}
              onValueChange={setTimeline}
            >
              <SelectTrigger id="timeline">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flexible">Flexible (Best Price)</SelectItem>
                <SelectItem value="normal">Normal (4-12 weeks)</SelectItem>
                <SelectItem value="urgent">Urgent (+25% Rush Fee)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Maintenance */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="maintenance"
              checked={maintenanceNeeded}
              onCheckedChange={(value) => {
                if (typeof value === 'boolean') {
                  setMaintenanceNeeded(value);
                }
              }}
            />
            <div className="text-sm">
              <Label htmlFor="maintenance" className="font-medium">
                Include Maintenance Package
              </Label>
              <p className="text-muted-foreground">
                Ongoing updates, security patches, and technical support
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!inputs.websiteType}
            className="w-full"
          >
            Calculate Estimate
          </Button>
        </form>
      ) : (
        <div>
          <CalculatorResults
            results={resultItems}
            calculatorType="cost-estimator"
            inputs={inputs}
          />

          <Button
            variant="outline"
            onClick={() => {
              setShowResults(false);
              setWebsiteType('');
              setNumberOfPages(5);
              setFeatures([]);
              setDesignComplexity('standard');
              setTimeline('normal');
              setMaintenanceNeeded(false);
            }}
            className="mt-content-block w-full"
          >
            Modify Estimate
          </Button>
        </div>
      )}
    </>
  );
}
