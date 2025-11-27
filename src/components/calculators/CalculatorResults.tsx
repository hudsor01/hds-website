/**
 * Calculator Results Component
 * Displays calculation results with email capture
 */

'use client';

import { useAttribution } from '@/hooks/useAttribution';
import { logger } from '@/lib/logger';
import { trackConversion } from '@/lib/analytics';
import { useState } from 'react';

interface ResultItem {
  label: string;
  value: string | number;
  description?: string;
  highlight?: boolean;
}

interface CalculatorResultsProps {
  results: ResultItem[];
  calculatorType: string;
  inputs: Record<string, unknown> | object;
  showEmailCapture?: boolean;
  onEmailSubmit?: (email: string) => void;
}

export function CalculatorResults({
  results,
  calculatorType,
  inputs,
  showEmailCapture = true,
  onEmailSubmit,
}: CalculatorResultsProps) {
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { sendAttribution } = useAttribution();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Send attribution with email
      await sendAttribution(email);

      // Store calculator results
      const response = await fetch('/api/calculators/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calculator_type: calculatorType,
          email,
          inputs,
          results: Object.fromEntries(
            results.map(r => [r.label, r.value])
          ),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit calculator results');
      }

      // Track conversion
      trackConversion('calculator_completion', undefined, {
        calculator_type: calculatorType,
        email,
      });

      setEmailSubmitted(true);
      if (onEmailSubmit) {
        onEmailSubmit(email);
      }
    } catch (err) {
      setError('Failed to send results. Please try again.');
      logger.error('Calculator submission error:', err as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Results Display */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground dark:text-white">
          Your Results
        </h3>

        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className={`
                rounded-lg border p-4
                ${
                  result.highlight
                    ? 'border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-900/20'
                    : 'border-border bg-muted dark:border-border dark:bg-muted'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground dark:text-muted">
                  {result.label}
                </span>
                <span
                  className={`
                    text-2xl font-bold
                    ${
                      result.highlight
                        ? 'text-cyan-600 dark:text-cyan-400'
                        : 'text-foreground dark:text-white'
                    }
                  `}
                >
                  {result.value}
                </span>
              </div>

              {result.description && (
                <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground">
                  {result.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Email Capture */}
      {showEmailCapture && !emailSubmitted && (
        <div className="rounded-lg border-2 border-dashed border-cyan-300 bg-cyan-50/50 p-6 dark:border-cyan-700 dark:bg-cyan-900/10">
          <h4 className="mb-2 text-lg font-semibold text-foreground dark:text-white">
            Get Your Detailed Report
          </h4>
          <p className="mb-4 text-sm text-muted-foreground dark:text-muted-foreground">
            Enter your email to receive a detailed breakdown and personalized recommendations.
          </p>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="block w-full rounded-md border-border shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-muted dark:text-white"
              />
              {error && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Get Detailed Report'}
            </button>

            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
              We&apos;ll never spam you. Unsubscribe anytime.
            </p>
          </form>
        </div>
      )}

      {/* Success Message */}
      {emailSubmitted && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Report sent successfully!
              </h3>
              <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                Check your email for the detailed breakdown and next steps.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="rounded-lg bg-muted p-6 text-center dark:bg-muted">
        <h4 className="mb-2 text-lg font-semibold text-foreground dark:text-white">
          Want to improve these numbers?
        </h4>
        <p className="mb-4 text-sm text-muted-foreground dark:text-muted-foreground">
          Let&apos;s discuss how we can help you achieve better results.
        </p>
        <a
          href="/contact"
          className="inline-flex items-center rounded-md bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700"
        >
          Schedule Free Consultation
        </a>
      </div>
    </div>
  );
}
