/**
 * Form Validation Hook
 * Centralized form validation logic
 * Handles field validation and error management
 */

import { useCallback, useState } from 'react';
import type { FieldValidation, FormValues } from '../types/forms';

export interface UseFormValidationReturn {
  errors: Record<string, string>;
  validateField: (fieldName: string, value: unknown, validationRules?: FieldValidation) => boolean;
  validateForm: (values: FormValues, validationRules: Record<string, FieldValidation>) => boolean;
  setFieldError: (fieldName: string, error: string) => void;
  clearFieldError: (fieldName: string) => void;
  clearAllErrors: () => void;
}

export function useFormValidation(): UseFormValidationReturn {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((
    fieldName: string,
    value: unknown,
    validationRules?: FieldValidation
  ): boolean => {
    if (!validationRules) {
      return true;
    }

    const stringValue = typeof value === 'string' ? value : String(value || '');

    // Required validation
    if (validationRules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      const message = typeof validationRules.required === 'string'
        ? validationRules.required
        : `${fieldName} is required`;
      setErrors(prev => ({ ...prev, [fieldName]: message }));
      return false;
    }

    // Min length validation
    if (validationRules.minLength && stringValue.length < validationRules.minLength.value) {
      setErrors(prev => ({ ...prev, [fieldName]: validationRules.minLength!.message }));
      return false;
    }

    // Max length validation
    if (validationRules.maxLength && stringValue.length > validationRules.maxLength.value) {
      setErrors(prev => ({ ...prev, [fieldName]: validationRules.maxLength!.message }));
      return false;
    }

    // Pattern validation
    if (validationRules.pattern && !validationRules.pattern.value.test(stringValue)) {
      setErrors(prev => ({ ...prev, [fieldName]: validationRules.pattern!.message }));
      return false;
    }

    // Custom validation
    if (validationRules.validate) {
      // Convert value to appropriate type for validation
      let validatedValue: string | number | boolean = stringValue;
      if (typeof value === 'number') {
        validatedValue = value;
      } else if (typeof value === 'boolean') {
        validatedValue = value;
      }

      const result = validationRules.validate(validatedValue);
      if (result !== true) {
        const message = typeof result === 'string' ? result : `${fieldName} is invalid`;
        setErrors(prev => ({ ...prev, [fieldName]: message }));
        return false;
      }
    }

    // Clear error if validation passes
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });

    return true;
  }, []);

  const validateForm = useCallback((
    values: FormValues,
    validationRules: Record<string, FieldValidation>
  ): boolean => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    Object.entries(validationRules).forEach(([fieldName, rules]) => {
      const fieldValue = values[fieldName];
      const fieldValid = validateField(fieldName, fieldValue, rules);
      if (!fieldValid) {
        isValid = false;
        const error = errors[fieldName];
        if (error) {
          newErrors[fieldName] = error;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validateField, errors]);

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    setFieldError,
    clearFieldError,
    clearAllErrors
  };
}
