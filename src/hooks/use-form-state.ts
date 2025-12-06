/**
 * Form State Hook
 * Standardized form state management
 * Handles loading, error, success states and form values
 */

import { useCallback, useState } from 'react';
import type { FormValues } from '../types/forms';

export interface UseFormStateReturn {
  state: 'idle' | 'submitting' | 'success' | 'error';
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: string | null;
  message?: string | null;
 values: FormValues;
  setValues: React.Dispatch<React.SetStateAction<FormValues>>;
  setState: React.Dispatch<React.SetStateAction<'idle' | 'submitting' | 'success' | 'error'>>;
  setError: React.Dispatch<React.SetStateAction<string | null | undefined>>;
  setMessage: React.Dispatch<React.SetStateAction<string | null | undefined>>;
  reset: () => void;
}

export function useFormState(defaultValues: FormValues = {}): UseFormStateReturn {
  const [values, setValues] = useState<FormValues>(defaultValues);
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>();
  const [message, setMessage] = useState<string | null>();

  const reset = useCallback(() => {
    setValues(defaultValues);
    setState('idle');
    setError(undefined);
    setMessage(undefined);
  }, [defaultValues]);

  return {
    state,
    isSubmitting: state === 'submitting',
    isSuccess: state === 'success',
    isError: state === 'error',
    error,
    message,
    values,
    setValues,
    setState,
    setError,
    setMessage,
    reset
  };
}
