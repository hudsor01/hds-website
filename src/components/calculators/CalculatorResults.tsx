/**
 * Calculator Results Component
 * Displays calculation results with email capture
 */

'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAttribution } from '@/hooks/useAttribution';
import { logger } from '@/lib/logger';
import { trackConversion } from '@/lib/analytics';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
            <div className="space-y-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
              {error && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Sending...' : 'Get Detailed Report'}
            </Button>

            <p className="text-xs text-muted-foreground">
              We&apos;ll never spam you. Unsubscribe anytime.
            </p>
          </form>
        </div>
      )}

      {/* Success Message */}
      {emailSubmitted && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-200">
            Report sent successfully!
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            Check your email for the detailed breakdown and next steps.
          </AlertDescription>
        </Alert>
      )}

      {/* CTA */}
      <div className="rounded-lg bg-muted p-6 text-center">
        <h4 className="mb-2 text-lg font-semibold text-foreground">
          Want to improve these numbers?
        </h4>
        <p className="mb-4 text-sm text-muted-foreground">
          Let&apos;s discuss how we can help you achieve better results.
        </p>
        <Button asChild>
          <a href="/contact">Schedule Free Consultation</a>
        </Button>
      </div>
    </div>
  );
}
