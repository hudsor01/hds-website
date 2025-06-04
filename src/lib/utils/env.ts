/**
 * Environment variable access helper
 * 
 * This utility provides type-safe access to environment variables
 * and fixes TypeScript TS4111 index signature access errors.
 */

import { z } from 'zod';

// Environment variable validation schemas
const serverEnvSchema = z.object({
  // Core Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database (Supabase)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // Authentication (Clerk)
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),

  // Cal.com Integration
  CAL_API_KEY: z.string().optional(),
  CAL_WEBHOOK_SECRET: z.string().optional(),

  // Email & Analytics
  RESEND_API_KEY: z.string().optional(),
  ARTIST_EMAIL: z.string().optional(),

  // App URL
  NEXT_PUBLIC_APP_URL: z.string().optional(),
});

const clientEnvSchema = z.object({
  // App URL
  NEXT_PUBLIC_APP_URL: z.string().optional(),

  // Database (Supabase)
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_URL is required'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),

  // Authentication (Clerk)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default('/admin'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default('/admin'),

  // Cal.com Integration
  NEXT_PUBLIC_CAL_USERNAME: z.string().optional(),

  // Analytics
  NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
});

// Validate environment variables
function validateServerEnv() {
  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid server environment variables:');
    result.error.issues.forEach((issue) => {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    });

    if (process.env['NODE_ENV'] === 'production') {
      throw new Error('Invalid server environment variables');
    }
  }

  return result.success ? result.data : {};
}

function validateClientEnv() {
  const clientEnv = {
    NEXT_PUBLIC_APP_URL: process.env['NEXT_PUBLIC_APP_URL'],
    NEXT_PUBLIC_SUPABASE_URL: process.env['NEXT_PUBLIC_SUPABASE_URL'],
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'],
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'],
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env['NEXT_PUBLIC_CLERK_SIGN_IN_URL'],
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env['NEXT_PUBLIC_CLERK_SIGN_UP_URL'],
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env['NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL'],
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env['NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL'],
    NEXT_PUBLIC_CAL_USERNAME: process.env['NEXT_PUBLIC_CAL_USERNAME'],
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: process.env['NEXT_PUBLIC_VERCEL_ANALYTICS_ID'],
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env['NEXT_PUBLIC_GA_MEASUREMENT_ID'],
  };

  const result = clientEnvSchema.safeParse(clientEnv);

  if (!result.success) {
    console.error('❌ Invalid client environment variables:');
    result.error.issues.forEach((issue) => {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    });

    if (process.env['NODE_ENV'] === 'production') {
      throw new Error('Invalid client environment variables');
    }
  }

  return result.success ? result.data : {};
}

// Export validated environment variables
const serverEnv = validateServerEnv();
const clientEnv = validateClientEnv();

// Combined ENV object for unified access
export const ENV = {
  // Client env variables
  NEXT_PUBLIC_SUPABASE_URL: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  NEXT_PUBLIC_APP_URL: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: getEnvVar('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: getEnvVar('NEXT_PUBLIC_CLERK_SIGN_IN_URL', '/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: getEnvVar('NEXT_PUBLIC_CLERK_SIGN_UP_URL', '/sign-up'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: getEnvVar('NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL', '/admin'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: getEnvVar('NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL', '/admin'),
  NEXT_PUBLIC_CAL_USERNAME: getEnvVar('NEXT_PUBLIC_CAL_USERNAME'),
  NEXT_PUBLIC_VERCEL_ANALYTICS_ID: getEnvVar('NEXT_PUBLIC_VERCEL_ANALYTICS_ID'),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: getEnvVar('NEXT_PUBLIC_GA_MEASUREMENT_ID'),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: getEnvVar('NEXT_PUBLIC_VAPID_PUBLIC_KEY'),
  
  // Server env variables
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  DIRECT_URL: getEnvVar('DIRECT_URL'),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  CLERK_SECRET_KEY: getEnvVar('CLERK_SECRET_KEY'),
  CAL_API_KEY: getEnvVar('CAL_API_KEY'),
  CAL_WEBHOOK_SECRET: getEnvVar('CAL_WEBHOOK_SECRET'),
  RESEND_API_KEY: getEnvVar('RESEND_API_KEY'),
  ARTIST_EMAIL: getEnvVar('ARTIST_EMAIL'),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  
  // Cal.com integration additional variables
  CAL_OAUTH_CLIENT_ID: getEnvVar('NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID'),
  CAL_ACCESS_TOKEN: getEnvVar('CAL_ACCESS_TOKEN'),
  CAL_REFRESH_URL: getEnvVar('CAL_REFRESH_URL', 'https://api.cal.com/v2/oauth/refresh'),
  CAL_API_URL: getEnvVar('CAL_API_URL', 'https://api.cal.com/v2'),
  CAL_ORGANIZATION_ID: getEnvVar('CAL_ORGANIZATION_ID'),
  CAL_FREE_CONSULTATION_EVENT_ID: getEnvVar('CAL_FREE_CONSULTATION_EVENT_ID'),
  CAL_DESIGN_REVIEW_EVENT_ID: getEnvVar('CAL_DESIGN_REVIEW_EVENT_ID'),
  CAL_TATTOO_SESSION_EVENT_ID: getEnvVar('CAL_TATTOO_SESSION_EVENT_ID'),
  CAL_TOUCH_UP_EVENT_ID: getEnvVar('CAL_TOUCH_UP_EVENT_ID'),
  
  // Webhook secrets
  CLERK_WEBHOOK_SECRET_USER: getEnvVar('CLERK_WEBHOOK_SECRET_USER'),
  CLERK_WEBHOOK_SECRET_SESSION: getEnvVar('CLERK_WEBHOOK_SECRET_SESSION'),
  CLERK_WEBHOOK_SECRET_ORG: getEnvVar('CLERK_WEBHOOK_SECRET_ORG'),
  
  // Contact info
  CONTACT_EMAIL: getEnvVar('CONTACT_EMAIL'),
  CONTACT_PHONE: getEnvVar('CONTACT_PHONE'),
  
  // Deployment
  VERCEL_URL: getEnvVar('VERCEL_URL'),
  PORT: getEnvVar('PORT', '3000'),
  
  // Build info
  BUILD_TIME: getEnvVar('BUILD_TIME'),
  NPM_PACKAGE_VERSION: getEnvVar('npm_package_version'),
};

/**
 * Get an environment variable with type safety
 * 
 * @param name The name of the environment variable
 * @param defaultValue Optional default value if not found
 * @returns The environment variable value or default
 */
export function getEnvVar(name: string, defaultValue: string = ''): string {
  // Use index notation to satisfy TS4111
  const value = process.env[name];
  // Make sure we return a string, not undefined or null
  return (value !== undefined && value !== '') ? value : defaultValue;
}

/**
 * Check if an environment variable is defined
 * 
 * @param name The name of the environment variable
 * @returns True if defined and not empty
 */
export function hasEnvVar(name: string): boolean {
  const value = process.env[name];
  return value !== undefined && value !== '';
}

/**
 * Get required environment variable with error handling
 * 
 * @param name The name of the environment variable
 * @throws Error if the environment variable is not defined
 * @returns The environment variable value
 */
export function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  
  if (value === undefined || value === '') {
    // In development, provide a helpful error
    if (process.env['NODE_ENV'] === 'development') {
      throw new Error(`Required environment variable ${name} is not defined. Please check your .env file.`);
    }
    
    // In production, log error but don't crash
    console.error(`Required environment variable ${name} is not defined.`);
    return '';
  }
  
  return value;
}

/**
 * Get environment variable with specific type casting
 * 
 * @param name The name of the environment variable
 * @param defaultValue Default value if environment variable is not defined
 * @returns The environment variable value cast to the type of defaultValue
 */
export function getTypedEnvVar<T>(name: string, defaultValue: T): T {
  const value = process.env[name];
  
  if (value === undefined || value === '') {
    return defaultValue;
  }
  
  try {
    // Try to parse the value as JSON if T is not string
    if (typeof defaultValue !== 'string') {
      return JSON.parse(value) as T;
    }
    
    // Otherwise treat as string
    return value as unknown as T;
  } catch {
    // If parsing fails, return the default value
    return defaultValue;
  }
}