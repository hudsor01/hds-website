/**
 * Centralized Form Type Definitions
 * Consolidates inline interfaces from form components, hooks, and utilities
 */

// Loading State Types
export interface LoadingState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: string | null;
}

export interface UseLoadingStateOptions {
  autoReset?: boolean;
  resetDelay?: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Form Submission States
export type FormSubmissionState = 
  | 'idle' 
  | 'submitting' 
  | 'success' 
  | 'error' 
  | 'validating';

export interface FormState {
  state: FormSubmissionState;
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: string | null;
  message?: string | null;
}

// Form Field Types
export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'url';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  icon?: React.ComponentType<{ className?: string }>;
  error?: string;
  helpText?: string;
  variant?: 'default' | 'glass' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface FormSelectProps {
  label: string;
  name: string;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  variant?: 'default' | 'glass' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface FormTextAreaProps {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  error?: string;
  helpText?: string;
  variant?: 'default' | 'glass' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  resize?: 'none' | 'y' | 'x' | 'both';
  className?: string;
}

// Form Validation Types
export interface FieldValidation {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  validate?: (value: string | number | boolean) => boolean | string;
}

export interface FormValidationRules {
  [fieldName: string]: FieldValidation;
}

// Form Value Types
export type FormValue = string | number | boolean | null | undefined;
export type FormValues = Record<string, FormValue>;

// Form Hook Types
export interface UseFormOptions {
  defaultValues?: FormValues;
  validationRules?: FormValidationRules;
  onSubmit?: (data: FormValues) => Promise<void> | void;
  onSuccess?: (data: FormValues) => void;
  onError?: (error: string) => void;
  resetOnSuccess?: boolean;
}

// Form Analytics Types
export interface FormTrackingEvent {
  formId: string;
  fieldName?: string;
  eventType: 'focus' | 'blur' | 'change' | 'submit' | 'error' | 'success';
  value?: FormValue;
  timestamp: string;
  sessionId: string;
}

export interface FormAnalytics {
  formId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  fieldInteractions: FormTrackingEvent[];
  submissionAttempts: number;
  validationErrors: Array<{
    field: string;
    error: string;
    timestamp: string;
  }>;
  abandoned: boolean;
  completed: boolean;
}

// Form Component State Types
export interface FormComponentState {
  isDirty: boolean;
  isTouched: boolean;
  isValid: boolean;
  errors: Record<string, string>;
  values: FormValues;
  isSubmitting: boolean;
  submitCount: number;
}

// Form Progress Types
export interface FormStep {
  id: string;
  label: string;
  isComplete: boolean;
  isActive: boolean;
  isRequired: boolean;
  fields: string[];
}

export interface MultiStepFormState {
  currentStep: number;
  totalSteps: number;
  steps: FormStep[];
  progress: number; // 0-100
  canGoNext: boolean;
  canGoPrevious: boolean;
}