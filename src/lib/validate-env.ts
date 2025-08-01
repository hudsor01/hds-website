import { validateEnv } from '@/schemas/env';

/**
 * Validates environment variables at runtime
 * This should be imported early in the application lifecycle
 */
export function initializeEnv() {
  try {
    const validatedEnv = validateEnv(process.env);
    
    // Log successful validation
    console.log('✅ Environment variables validated successfully');
    
    // In development, log which optional vars are missing
    if (process.env.NODE_ENV === 'development') {
      const optionalVars = [
        'NEXT_PUBLIC_GA_MEASUREMENT_ID',
        'GA4_API_SECRET',
        'NEXT_PUBLIC_POSTHOG_KEY',
        'NEXT_PUBLIC_POSTHOG_HOST',
        'N8N_WEBHOOK_URL',
        'N8N_API_KEY',
      ];
      
      const missingOptional = optionalVars.filter(v => !process.env[v]);
      if (missingOptional.length > 0) {
        console.info('ℹ️  Optional environment variables not set:', missingOptional.join(', '));
      }
    }
    
    return validatedEnv;
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    
    // In production, throw to prevent startup with invalid config
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment configuration. Check server logs for details.');
    }
    
    // In development, warn but continue
    console.warn('⚠️  Continuing with invalid environment configuration (development mode)');
    return null;
  }
}

// Initialize on import
export const env = initializeEnv();