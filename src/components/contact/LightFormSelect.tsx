import * as React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { type ContactFormData } from '@/schemas/contact';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface LightFormSelectProps {
  name: keyof ContactFormData;
  label: string;
  placeholder?: string;
  options: Array<{ label: string; value: string }>;
  register: UseFormRegister<ContactFormData>;
  error?: string;
  required?: boolean;
  className?: string;
}

export function LightFormSelect({
  name,
  label,
  placeholder,
  options,
  register,
  error,
  required = false,
  className,
}: LightFormSelectProps) {
  return (
    <div className={cn("animate-in fade-in slide-in-from-bottom-2 duration-300", className)}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      <div className="relative">
        <select
          {...register(name)}
          id={name}
          className={cn(
            "w-full appearance-none px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 pr-10",
            error
              ? "bg-gray-800 border border-red-500 text-white placeholder-red-300 focus:ring-red-500"
              : "bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 hover:border-gray-600"
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
        >
          <option value="" disabled>
            {placeholder || `Select ${label.toLowerCase()}`}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <p
          id={`${name}-error`}
          className="mt-1 text-sm text-red-400 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          {error}
        </p>
      )}
    </div>
  );
}