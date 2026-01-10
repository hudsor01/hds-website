/**
 * JSON Formatter
 * Format, validate, and minify JSON data
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { CalculatorLayout } from '@/components/calculators/CalculatorLayout';
import { TIMEOUTS } from '@/lib/constants';
import { trackEvent } from '@/lib/analytics';
import { Copy, Check, Braces, AlertCircle, CheckCircle2 } from 'lucide-react';
import { logger } from '@/lib/logger';

export default function JsonFormatterPage() {
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [indentSize, setIndentSize] = useState(2);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutputJson(formatted);
      setError(null);
      setIsValid(true);

      trackEvent('calculator_used', {
        calculator_type: 'json-formatter',
        action: 'format',
        input_length: inputJson.length,
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Invalid JSON';
      setError(errorMessage);
      setOutputJson('');
      setIsValid(false);
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      setOutputJson(minified);
      setError(null);
      setIsValid(true);

      trackEvent('calculator_used', {
        calculator_type: 'json-formatter',
        action: 'minify',
        input_length: inputJson.length,
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Invalid JSON';
      setError(errorMessage);
      setOutputJson('');
      setIsValid(false);
    }
  };

  const validateJson = () => {
    try {
      JSON.parse(inputJson);
      setIsValid(true);
      setError(null);

      trackEvent('calculator_used', {
        calculator_type: 'json-formatter',
        action: 'validate',
        is_valid: true,
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Invalid JSON';
      setError(errorMessage);
      setIsValid(false);

      trackEvent('calculator_used', {
        calculator_type: 'json-formatter',
        action: 'validate',
        is_valid: false,
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputJson);
      setCopied(true);
      setTimeout(() => setCopied(false), TIMEOUTS.COPY_FEEDBACK);
    } catch (error) {
      // Fallback for browsers without clipboard API
      logger.debug('Clipboard API unavailable, using fallback', {
        error: error instanceof Error ? error.message : String(error),
      });
      const textArea = document.createElement('textarea');
      textArea.value = outputJson;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), TIMEOUTS.COPY_FEEDBACK);
    }
  };

  const clearAll = () => {
    setInputJson('');
    setOutputJson('');
    setError(null);
    setIsValid(null);
  };

  const loadSample = () => {
    const sample = {
      name: "Hudson Digital Solutions",
      services: ["Web Development", "SaaS Consulting", "Digital Marketing"],
      contact: {
        email: "hello@hudsondigitalsolutions.com",
        location: "Texas, USA"
      },
      stats: {
        clients: 50,
        satisfaction: "100%",
        yearsExperience: 5
      }
    };
    setInputJson(JSON.stringify(sample));
    setOutputJson('');
    setError(null);
    setIsValid(null);
  };

  return (
    <CalculatorLayout
      title="JSON Formatter"
      description="Format, validate, and minify your JSON data with syntax highlighting"
      icon={
        <Braces className="h-8 w-8 text-primary" />
      }
    >
      <div className="space-y-comfortable">
        {/* Input Section */}
        <div>
          <div className="flex items-center justify-between mb-subheading">
            <label className="block text-sm font-medium text-foreground">
              Input JSON
            </label>
            <div className="flex gap-tight">
              <button
                onClick={loadSample}
                className="text-xs text-primary hover:text-primary-hover"
              >
                Load Sample
              </button>
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={inputJson}
            onChange={(e) => {
              setInputJson(e.target.value);
              setIsValid(null);
              setError(null);
            }}
            className={`w-full rounded-md border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary ${
              error ? 'border-destructive' : isValid === true ? 'border-success' : 'border-border'
            }`}
            rows={10}
            placeholder='{"key": "value"}'
            spellCheck={false}
          />

          {/* Validation Status */}
          {error && (
            <div className="mt-2 flex items-start gap-tight text-destructive-dark dark:text-destructive-text">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {isValid === true && !error && (
            <div className="mt-2 flex items-center gap-tight text-success-dark dark:text-success-text">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">Valid JSON</span>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="flex flex-wrap items-center gap-content">
          <div className="flex items-center gap-tight">
            <label className="text-sm text-muted-foreground">Indent:</label>
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(Number(e.target.value))}
              className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={1}>1 tab</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={formatJson}
            disabled={!inputJson.trim()}
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs hover:bg-primary-hover focus:outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Format
          </button>
          <button
            onClick={minifyJson}
            disabled={!inputJson.trim()}
            className="rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs hover:bg-muted dark:bg-muted dark:hover:bg-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Minify
          </button>
          <button
            onClick={validateJson}
            disabled={!inputJson.trim()}
            className="rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs hover:bg-muted dark:bg-muted dark:hover:bg-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Validate
          </button>
        </div>

        {/* Output Section */}
        {outputJson && (
          <div>
            <div className="flex items-center justify-between mb-subheading">
              <label className="block text-sm font-medium text-foreground">
                Output
              </label>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="w-full rounded-md border border-border bg-background p-4 overflow-x-auto">
              <code className="text-sm text-foreground whitespace-pre-wrap break-all font-mono">
                {outputJson}
              </code>
            </pre>

            {/* Stats */}
            <div className="mt-2 flex gap-content text-xs text-muted-foreground">
              <span>Input: {inputJson.length} chars</span>
              <span>Output: {outputJson.length} chars</span>
              {inputJson.length !== outputJson.length && (
                <span className={outputJson.length < inputJson.length ? 'text-success-dark' : 'text-warning-dark'}>
                  {outputJson.length < inputJson.length
                    ? `Reduced by ${((1 - outputJson.length / inputJson.length) * 100).toFixed(1)}%`
                    : `Increased by ${((outputJson.length / inputJson.length - 1) * 100).toFixed(1)}%`
                  }
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Educational Content */}
      <div className="mt-heading space-y-content border-t pt-8 dark:border-border">
        <h3 className="text-lg font-semibold text-foreground dark:text-foreground">
          JSON Tips
        </h3>

        <div className="grid gap-content sm:grid-cols-2">
          <Card size="sm">
            <h4 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Common Errors
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Missing quotes around keys, trailing commas, and single quotes instead of double quotes are common JSON mistakes.
            </p>
          </Card>

          <Card size="sm">
            <h4 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Data Types
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              JSON supports strings, numbers, booleans, null, arrays, and objects. No undefined, functions, or dates.
            </p>
          </Card>

          <Card size="sm">
            <h4 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Minification
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Minifying JSON removes whitespace to reduce file size, useful for API responses and data transfer.
            </p>
          </Card>

          <Card size="sm">
            <h4 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Formatting
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Pretty-printing JSON with indentation makes it human-readable for debugging and configuration files.
            </p>
          </Card>
        </div>
      </div>
    </CalculatorLayout>
  );
}
