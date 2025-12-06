/**
 * Calculator Results Component
 * Displays calculation results with email capture
 */

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAttribution } from '@/hooks/useAttribution';
import { trackConversion } from '@/lib/analytics';
import { logger } from '@/lib/logger';
import { CheckCircle2 } from 'lucide-react';
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
    <div className="space-y-comfortable">
      {/* Results Display */}
      <div className="space-y-content">
        <h3 className="text-xl font-semibold text-foreground dark:text-primary-foreground">
          Your Results
        </h3>

        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className={`
                rounded-lg border card-padding-sm
                ${
                  result.highlight
                    ? 'border-accent/40 bg-accent/10 dark:border-primary-hover dark:bg-primary-hover/20'
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
                        ? 'text-primary dark:text-accent'
                        : 'text-foreground dark:text-primary-foreground'
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
        <div className="rounded-lg border-2 border-dashed border-accent/60 bg-accent/10/50 card-padding dark:border-primary-hover dark:bg-primary-hover/10">
          <h4 className="mb-subheading text-lg font-semibold text-foreground dark:text-primary-foreground">
            Get Your Detailed Report
          </h4>
          <p className="mb-heading text-sm text-muted-foreground dark:text-muted-foreground">
            Enter your email to receive a detailed breakdown and personalized recommendations.
          </p>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div className="space-y-tight">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
              {error && (
                <p className="text-xs text-destructive-dark dark:text-destructive-text">
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
        <Alert className="border-success/50 bg-success/10">
          <CheckCircle2 className="h-5 w-5 text-success-dark" />
          <AlertTitle className="text-success-darker dark:text-success-light">
            Report sent successfully!
          </AlertTitle>
          <AlertDescription className="text-success-darker dark:text-success-muted">
            Check your email for the detailed breakdown and next steps.
          </AlertDescription>
        </Alert>
      )}

      {/* CTA */}
      <div className="rounded-lg bg-muted card-padding text-center">
        <h4 className="mb-subheading text-lg font-semibold text-foreground">
          Want to improve these numbers?
        </h4>
        <p className="mb-heading text-sm text-muted-foreground">
          Let&apos;s discuss how we can help you achieve better results.
        </p>
        <Button asChild>
          <a href="/contact">Schedule Free Consultation</a>
        </Button>
      </div>
    </div>
  );
}
