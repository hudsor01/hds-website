'use client';

import * as React from 'react';
import * as Select from '@radix-ui/react-select';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { type ContactFormData } from '@/schemas/contact';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
// Removed Framer Motion - using CSS animations for performance

const selectTriggerVariants = cva(
  'flex h-12 w-full items-center justify-between rounded-lg border px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-black/40 border-gray-600 text-white focus:ring-cyan-400 focus:border-transparent hover:border-gray-500',
        glass: 'bg-white/10 backdrop-blur-md border-white/20 text-white focus:ring-cyan-400/50 hover:border-white/30',
        solid: 'bg-gray-800 border-gray-700 text-white focus:ring-cyan-400 hover:bg-gray-700',
      },
      state: {
        default: '',
        error: 'border-red-500 focus:ring-red-400',
      },
    },
    defaultVariants: {
      variant: 'default',
      state: 'default',
    },
  }
);

interface FormSelectProps extends VariantProps<typeof selectTriggerVariants> {
  label: string;
  name: keyof ContactFormData;
  options: { value: string; label: string }[];
  register: UseFormRegister<ContactFormData>;
  setValue?: UseFormSetValue<ContactFormData>;
  className?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export function FormSelect({
  label,
  name,
  options,
  register,
  setValue,
  className = '',
  placeholder,
  error,
  required = false,
  variant,
}: FormSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const fieldState = error ? 'error' : 'default';
  
  // Register the field with react-hook-form
  React.useEffect(() => {
    register(name);
  }, [register, name]);
  
  const placeholderText = placeholder || `Select ${label.toLowerCase()}`;
  
  return (
    <div className={cn("animate-in fade-in slide-in-from-bottom-2 duration-300", className)}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      <Select.Root 
        onValueChange={(value) => setValue && setValue(name, value as ContactFormData[keyof ContactFormData])}
        onOpenChange={setIsOpen}
      >
        <Select.Trigger 
          className={cn(selectTriggerVariants({ variant, state: fieldState }))}
          id={name}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
        >
          <Select.Value placeholder={placeholderText} />
          <Select.Icon>
            <div className={cn("transition-transform duration-200", isOpen && "rotate-180")}>
              <ChevronDownIcon className="h-4 w-4 opacity-50" />
            </div>
          </Select.Icon>
        </Select.Trigger>
        
        <Select.Portal>
          <Select.Content 
            className="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border border-gray-700 bg-gray-800/95 backdrop-blur-md shadow-lg animate-in fade-in-0 zoom-in-95"
            position="popper"
            sideOffset={5}
          >
            <Select.Viewport className="p-1">
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 pl-8 pr-4 text-sm text-white outline-none transition-colors hover:bg-cyan-500/20 focus:bg-cyan-500/20 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Select.ItemIndicator>
                      <CheckIcon className="h-4 w-4 text-cyan-400" />
                    </Select.ItemIndicator>
                  </span>
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      
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