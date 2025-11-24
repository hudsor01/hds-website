/**
 * Calculator Input Component
 * Reusable input field for calculator forms
 */

'use client';

import { type InputHTMLAttributes } from 'react';

interface CalculatorInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  helpText?: string;
  prefix?: string;
  suffix?: string;
}

export function CalculatorInput({
  label,
  id,
  error,
  helpText,
  prefix,
  suffix,
  className = '',
  ...props
}: CalculatorInputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>

      <div className="relative">
        {prefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
              {prefix}
            </span>
          </div>
        )}

        <input
          id={id}
          className={`
            block w-full rounded-md border-gray-300 shadow-sm
            focus:border-cyan-500 focus:ring-cyan-500
            dark:border-gray-600 dark:bg-gray-700 dark:text-white
            dark:focus:border-cyan-400 dark:focus:ring-cyan-400
            ${prefix ? 'pl-7' : ''}
            ${suffix ? 'pr-12' : ''}
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />

        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
              {suffix}
            </span>
          </div>
        )}
      </div>

      {helpText && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
