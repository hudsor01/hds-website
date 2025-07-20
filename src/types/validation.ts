// Validation schema types
export type FieldType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export interface ValidationRule {
  required?: boolean;
  type?: FieldType;
  pattern?: RegExp;
  min?: number;
  max?: number;
  validator?: (value: unknown) => boolean;
}

export type ValidationSchema = Record<string, ValidationRule>;

export interface ValidationResult<T> {
  valid: boolean;
  errors: string[];
  data?: T;
}

// Request body type for API routes
export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  budget?: string;
  message: string;
}

// Sanitized request data
export interface SanitizedRequestData {
  [key: string]: string | number | boolean | null | SanitizedRequestData | SanitizedRequestData[];
}