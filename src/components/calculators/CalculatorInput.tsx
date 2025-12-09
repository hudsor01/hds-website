/**
 * Calculator Input Component
 * Reusable input field for calculator forms using shadcn/ui
 */

'use client';

import { type InputHTMLAttributes } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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
    <div className="space-y-tight">
      <Label htmlFor={id}>{label}</Label>

      <div className="relative">
        {prefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-muted-foreground text-sm">{prefix}</span>
          </div>
        )}

        <Input
          id={id}
          className={cn(
            prefix && 'pl-7',
            suffix && 'pr-12',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...props}
        />

        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-muted-foreground text-sm">{suffix}</span>
          </div>
        )}
      </div>

      {helpText && !error && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
