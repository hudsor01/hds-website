/**
 * Base Form Component
 * Standardized form component with built-in state management, validation, and analytics
 */

import React, { useCallback } from 'react';
import { useFormAnalytics } from '../../hooks/use-form-analytics';
import { useFormState } from '../../hooks/use-form-state';
import { useFormValidation } from '../../hooks/use-form-validation';
import type { FormValues, UseFormOptions } from '../../types/forms';

interface BaseFormProps {
  formId: string;
  options: UseFormOptions;
  children: React.ReactNode | ((context: BaseFormContext) => React.ReactNode);
  onSubmit?: (data: FormValues) => Promise<void> | void;
  onValidate?: (values: FormValues, isValid: boolean) => void;
 [key: string]: any; // Allow other HTML form attributes
}

export function BaseForm({
  formId,
  options,
  children,
  onSubmit,
  onValidate,
  ...props
}: BaseFormProps) {
  const { values, setValues, state, isSubmitting, isSuccess, isError, error, message, reset } = useFormState(options.defaultValues);
  const { errors, validateForm, clearAllErrors } = useFormValidation();
  const { trackFormInteraction, trackFormSubmission } = useFormAnalytics();

  const handleChange = useCallback((fieldName: string, value: unknown) => {
    setValues(prev => ({ ...prev, [fieldName]: value as string | number | boolean | null | undefined }));
    trackFormInteraction(formId, 'change', fieldName, value as string | number | boolean | null | undefined);
  }, [setValues, trackFormInteraction, formId]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    trackFormInteraction(formId, 'submit');

    if (options.validationRules) {
      const isValid = validateForm(values, options.validationRules);
      onValidate?.(values, isValid);

      if (!isValid) {
        trackFormSubmission(formId, false, 'Validation failed');
        return;
      }
    }

    try {
      if (onSubmit) {
        await onSubmit(values);
        trackFormSubmission(formId, true);
        options.onSuccess?.(values);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Submission failed';
      trackFormSubmission(formId, false, errorMessage);
      options.onError?.(errorMessage);
    }
  }, [values, onSubmit, validateForm, options, trackFormInteraction, trackFormSubmission, formId, onValidate]);

  const contextValue = {
    values,
    errors,
    state,
    isSubmitting,
    isSuccess,
    isError,
    error,
    message,
    handleChange,
    handleSubmit,
    reset,
    clearAllErrors
  };

  return (
    <form onSubmit={handleSubmit} {...props}>
      {typeof children === 'function' ? children(contextValue) : children}
    </form>
  );
}

export interface BaseFormContext {
  values: FormValues;
  errors: Record<string, string>;
  state: 'idle' | 'submitting' | 'success' | 'error';
 isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: string | null;
  message?: string | null;
  handleChange: (fieldName: string, value: unknown) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reset: () => void;
  clearAllErrors: () => void;
}
