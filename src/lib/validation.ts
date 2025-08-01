import { z } from 'zod';
import { NextRequest } from 'next/server';

// Type for Zod validation results formatted for forms
export type FormErrors<T> = {
  [K in keyof T]?: string[];
};

// Convert Zod errors to form-friendly format
export function formatZodErrors<T>(error: z.ZodError): FormErrors<T> {
  const formattedErrors: FormErrors<T> = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!formattedErrors[path as keyof T]) {
      formattedErrors[path as keyof T] = [];
    }
    formattedErrors[path as keyof T]!.push(issue.message);
  });
  
  return formattedErrors;
}

// Validate request body with Zod schema
export async function validateRequestWithZod<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ 
  success: true; 
  data: T; 
} | { 
  success: false; 
  errors: FormErrors<T>;
  message: string;
}> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    return {
      success: false,
      errors: formatZodErrors<T>(result.error),
      message: 'Validation failed',
    };
  } catch {
    return {
      success: false,
      errors: {} as FormErrors<T>,
      message: 'Invalid request body',
    };
  }
}

// Validate data with Zod schema (non-request)
export function validateWithZod<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { 
  success: true; 
  data: T; 
} | { 
  success: false; 
  errors: FormErrors<T>;
  message: string;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    errors: formatZodErrors<T>(result.error),
    message: 'Validation failed',
  };
}

// Helper to create API response with Zod validation
export function createValidatedResponse<T>(
  result: { success: true; data: T } | { success: false; errors: FormErrors<T>; message: string },
  successMessage?: string
) {
  if (result.success) {
    return Response.json({
      success: true,
      message: successMessage || 'Success',
      data: result.data,
    });
  }
  
  return Response.json({
    success: false,
    message: result.message,
    errors: result.errors,
  }, { status: 400 });
}

// Enhanced sanitization using Zod transforms
export const sanitizedStringSchema = z
  .string()
  .transform((val) => val.trim())
  .transform((val) => {
    // Remove potentially dangerous patterns
    return val
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/script\b/gi, '') // Remove script references
      .replace(/eval\s*\(/gi, '') // Remove eval
      .replace(/expression\s*\(/gi, ''); // Remove CSS expressions
  });

// Common field transformations
export const transformers = {
  toLowerCase: (val: string) => val.toLowerCase(),
  toUpperCase: (val: string) => val.toUpperCase(),
  trim: (val: string) => val.trim(),
  removeWhitespace: (val: string) => val.replace(/\s/g, ''),
  normalizePhone: (val: string) => val.replace(/[^\d+]/g, ''),
  normalizeUrl: (val: string) => {
    if (!val.startsWith('http://') && !val.startsWith('https://')) {
      return `https://${val}`;
    }
    return val;
  },
};