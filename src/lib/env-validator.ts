// Environment variable validation
export function validateEnvVars() {
  const required = [
    'RESEND_API_KEY',
    'CRON_SECRET',
  ];

  const recommended = [
    'NEXT_PUBLIC_GA_MEASUREMENT_ID',
    'GA4_API_SECRET',
    'NEXT_PUBLIC_POSTHOG_KEY',
    'NEXT_PUBLIC_POSTHOG_HOST',
    'GHOST_URL',
    'GHOST_CONTENT_API_KEY',
    'GOOGLE_SITE_VERIFICATION',
  ];

  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  required.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check recommended variables
  recommended.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  });

  // Validate format of specific variables
  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_')) {
    console.warn('RESEND_API_KEY should start with "re_"');
  }

  if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && !process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID.startsWith('G-')) {
    console.warn('NEXT_PUBLIC_GA_MEASUREMENT_ID should start with "G-"');
  }

  if (process.env.GHOST_URL && !process.env.GHOST_URL.startsWith('http')) {
    console.warn('GHOST_URL should be a valid URL starting with http:// or https://');
  }

  // Check for development vs production settings
  if (process.env.NODE_ENV === 'production') {
    // Ensure CRON_SECRET is strong enough
    if (process.env.CRON_SECRET && process.env.CRON_SECRET.length < 32) {
      console.warn('CRON_SECRET should be at least 32 characters long in production');
    }

    // Ensure analytics are configured
    if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && !process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      console.warn('No analytics configured for production');
    }
  }

  // Report findings
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required environment variables');
    }
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Missing recommended environment variables:', warnings.join(', '));
  }

  console.log('✅ Environment variables validated');
}

// Type-safe environment variable access
export const env = {
  // Required
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
  CRON_SECRET: process.env.CRON_SECRET!,
  
  // Optional but recommended
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  GA4_API_SECRET: process.env.GA4_API_SECRET,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
  GHOST_URL: process.env.GHOST_URL,
  GHOST_CONTENT_API_KEY: process.env.GHOST_CONTENT_API_KEY,
  GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
  
  // System
  NODE_ENV: process.env.NODE_ENV || 'development',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://hudsondigitalsolutions.com',
} as const;