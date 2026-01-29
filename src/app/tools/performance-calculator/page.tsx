/**
 * Performance Savings Calculator
 * Analyzes website performance and calculates revenue lost due to slow load times
 */

'use client';

  import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { CalculatorLayout } from '@/components/calculators/CalculatorLayout';
import { CalculatorInput } from '@/components/calculators/CalculatorInput';
import { CalculatorResults } from '@/components/calculators/CalculatorResults';
import { logger } from '@/lib/logger';
import { trackEvent } from '@/lib/analytics';
import { formatCurrency } from '@/lib/utils';

interface PerformanceMetrics {
  performanceScore: number;
  fcp: string;
  lcp: string;
  tbt: string;
  cls: string;
  speedIndex: string;
}

interface CalculatorInputs {
  websiteUrl: string;
  monthlyVisitors: number;
  averageOrderValue: number;
  currentConversionRate: number;
}

export default function PerformanceCalculatorPage() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    websiteUrl: '',
    monthlyVisitors: 0,
    averageOrderValue: 0,
    currentConversionRate: 0,
  });

  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<Record<string, string>>({});

  const analyzeWebsite = async () => {
    setIsAnalyzing(true);
    setError('');

    try {
      const response = await fetch(
        `/api/pagespeed?url=${encodeURIComponent(inputs.websiteUrl)}`
      );

      if (!response.ok) {
        throw new Error('Failed to analyze website');
      }

      const data = await response.json();
      setMetrics(data.metrics);

      // Calculate impact
      calculateImpact(data.metrics);
    } catch (err) {
      setError('Failed to analyze website. Please check the URL and try again.');
      logger.error('Performance analysis error:', err as Error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateImpact = (performanceMetrics: PerformanceMetrics) => {
    const score = performanceMetrics.performanceScore;

    // Industry data: conversion rate drops significantly with poor performance
    // For every 100ms delay, conversions drop by ~1%
    // A score of 0-49 is "slow", 50-89 is "average", 90-100 is "fast"

    let conversionImpact = 0;
    if (score < 50) {
      conversionImpact = 0.25; // 25% conversion loss
    } else if (score < 70) {
      conversionImpact = 0.15; // 15% conversion loss
    } else if (score < 90) {
      conversionImpact = 0.05; // 5% conversion loss
    }

    // Calculate current revenue
    const currentConversionRate = inputs.currentConversionRate / 100;
    const monthlyConversions = inputs.monthlyVisitors * currentConversionRate;
    const monthlyRevenue = monthlyConversions * inputs.averageOrderValue;
    const annualRevenue = monthlyRevenue * 12;

    // Calculate lost revenue
    const potentialConversionRate = currentConversionRate / (1 - conversionImpact);
    const potentialMonthlyConversions = inputs.monthlyVisitors * potentialConversionRate;
    const potentialMonthlyRevenue = potentialMonthlyConversions * inputs.averageOrderValue;
    const potentialAnnualRevenue = potentialMonthlyRevenue * 12;

    const monthlyLoss = potentialMonthlyRevenue - monthlyRevenue;
    const annualLoss = potentialAnnualRevenue - annualRevenue;

    // Speed improvement metrics
    const improvementNeeded = score < 90 ? 90 - score : 0;
    const estimatedLoadTimeReduction = improvementNeeded * 50; // Rough estimate in ms

    const calculatedResults = {
      performanceScore: `${score}/100`,
      currentRevenue: `${formatCurrency(monthlyRevenue)}/mo`,
      potentialRevenue: `${formatCurrency(potentialMonthlyRevenue)}/mo`,
      monthlyLoss: formatCurrency(monthlyLoss),
      annualLoss: formatCurrency(annualLoss),
      conversionImpact: `${(conversionImpact * 100).toFixed(1)}%`,
      loadTimeReduction: `${estimatedLoadTimeReduction}ms`,
      recommendation: getRecommendation(score),
    };

    setResults(calculatedResults);
    setShowResults(true);

    // Track calculator usage
    trackEvent('calculator_used', {
      calculator_type: 'performance-calculator',
      website_url: inputs.websiteUrl,
      performance_score: score,
      annual_loss: annualLoss,
    });
  };

  const getRecommendation = (score: number): string => {
    if (score >= 90) {return 'Excellent - Minor optimizations only';}
    if (score >= 70) {return 'Good - Moderate optimizations needed';}
    if (score >= 50) {return 'Fair - Significant improvements required';}
    return 'Poor - Critical performance issues';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeWebsite();
  };

  const resultItems = metrics ? [
    {
      label: 'Performance Score',
      value: results.performanceScore || '0/100',
      description: results.recommendation || '',
      highlight: (metrics.performanceScore || 0) < 70,
    },
    {
      label: 'Monthly Revenue Loss',
      value: results.monthlyLoss || '$0',
      description: 'Estimated lost revenue per month',
      highlight: true,
    },
    {
      label: 'Annual Revenue Loss',
      value: results.annualLoss || '$0',
      description: 'Total estimated lost revenue per year',
      highlight: true,
    },
    {
      label: 'Conversion Impact',
      value: results.conversionImpact || '0%',
      description: 'Performance impact on conversion rate',
    },
    {
      label: 'Potential Monthly Revenue',
      value: results.potentialRevenue || '$0',
      description: 'With optimized performance',
    },
    {
      label: 'Load Time Reduction Needed',
      value: results.loadTimeReduction || '0ms',
      description: 'Estimated improvement to reach 90+ score',
    },
  ] : [];

  return (
    <CalculatorLayout
      title="Performance Savings Calculator"
      description="Discover how much revenue you're losing due to slow website performance"
      icon={
        <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      }
    >
      {!showResults ? (
        <form onSubmit={handleSubmit} className="space-y-comfortable">
          <CalculatorInput
            label="Website URL"
            id="websiteUrl"
            type="url"
            placeholder="https://example.com"
            value={inputs.websiteUrl}
            onChange={(e) => setInputs(prev => ({ ...prev, websiteUrl: e.target.value }))}
            helpText="Enter your website URL to analyze performance"
            required
          />

          <div className="grid gap-comfortable md:grid-cols-2">
            <CalculatorInput
              label="Monthly Visitors"
              id="monthlyVisitors"
              type="number"
              min="0"
              step="1"
              value={inputs.monthlyVisitors || ''}
              onChange={(e) => setInputs(prev => ({ ...prev, monthlyVisitors: parseInt(e.target.value) || 0 }))}
              helpText="Average monthly website visitors"
              required
            />

            <CalculatorInput
              label="Average Order Value"
              id="averageOrderValue"
              type="number"
              min="0"
              step="0.01"
              prefix="$"
              value={inputs.averageOrderValue || ''}
              onChange={(e) => setInputs(prev => ({ ...prev, averageOrderValue: parseFloat(e.target.value) || 0 }))}
              helpText="Average value per conversion"
              required
            />

            <CalculatorInput
              label="Current Conversion Rate"
              id="currentConversionRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              suffix="%"
              value={inputs.currentConversionRate || ''}
              onChange={(e) => setInputs(prev => ({ ...prev, currentConversionRate: parseFloat(e.target.value) || 0 }))}
              helpText="Percentage of visitors who convert"
              required
            />
          </div>

          {error && (
            <Card size="sm" className="bg-destructive-light dark:bg-destructive-bg-dark/20">
              <p className="text-sm text-destructive-dark dark:text-destructive-text">{error}</p>
            </Card>
          )}

          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full rounded-md bg-primary px-6 py-3 text-base font-semibold text-foreground shadow-xs hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-primary"
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Website...
              </span>
            ) : (
              'Analyze Performance'
            )}
          </button>

          <Card size="sm" className="bg-info-light dark:bg-info-bg-dark/20">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-info-text" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-info-darker dark:text-info-muted">
                  <strong>Industry Data:</strong> A 1-second delay in page load time can reduce conversions by 7%. Pages loading in under 2 seconds have the highest conversion rates.
                </p>
              </div>
            </div>
          </Card>
        </form>
      ) : (
        <div>
          {/* Core Web Vitals Display */}
          {metrics && (
            <Card className="mb-content-block bg-muted dark:bg-muted">
              <h3 className="mb-heading text-lg font-semibold text-foreground dark:text-foreground">
                Core Web Vitals
              </h3>
              <div className="grid gap-content sm:grid-cols-3">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground dark:text-muted-foreground">LCP</div>
                  <div className="text-xl font-bold text-foreground dark:text-foreground">{metrics.lcp}</div>
                  <div className="text-xs text-muted-foreground">Largest Contentful Paint</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground dark:text-muted-foreground">FCP</div>
                  <div className="text-xl font-bold text-foreground dark:text-foreground">{metrics.fcp}</div>
                  <div className="text-xs text-muted-foreground">First Contentful Paint</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground dark:text-muted-foreground">CLS</div>
                  <div className="text-xl font-bold text-foreground dark:text-foreground">{metrics.cls}</div>
                  <div className="text-xs text-muted-foreground">Cumulative Layout Shift</div>
                </div>
              </div>
            </Card>
          )}

          <CalculatorResults
            results={resultItems}
            calculatorType="performance-calculator"
            inputs={{ ...inputs, performanceScore: metrics?.performanceScore }}
          />

          <button
            onClick={() => {
              setShowResults(false);
              setMetrics(null);
            }}
            className="mt-content-block w-full rounded-md border border-border bg-card px-6 py-3 text-base font-semibold text-muted-foreground shadow-xs hover:bg-muted dark:border-border dark:bg-muted dark:text-muted dark:hover:bg-muted-foreground"
          >
            ← Analyze Another Site
          </button>
        </div>
      )}

      {/* Performance Tips */}
      <div className="mt-heading space-y-content border-t pt-8 dark:border-border">
        <h3 className="text-lg font-semibold text-foreground dark:text-foreground">
          How We Optimize Performance
        </h3>

        <div className="space-y-3">
          {[
            { title: 'Image Optimization', desc: 'WebP format, lazy loading, responsive images' },
            { title: 'Code Splitting', desc: 'Load only what\'s needed, when it\'s needed' },
            { title: 'CDN Deployment', desc: 'Global edge network for faster delivery' },
            { title: 'Caching Strategy', desc: 'Smart caching to minimize server requests' },
            { title: 'Critical CSS', desc: 'Inline critical styles for faster rendering' },
            { title: 'Minification', desc: 'Compressed code for smaller file sizes' },
          ].map((tip, index) => (
            <div key={index} className="flex items-start gap-3 rounded-lg border border-border p-3 dark:border-border">
              <svg className="h-5 w-5 shrink-0 text-primary dark:text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="font-medium text-foreground dark:text-foreground">{tip.title}</div>
                <div className="text-sm text-muted-foreground dark:text-muted-foreground">{tip.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CalculatorLayout>
  );
}
