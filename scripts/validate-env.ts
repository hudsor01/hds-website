#!/usr/bin/env tsx

/**
 * Environment Variables Validation Script
 * 
 * This script validates that all required environment variables are set
 * and meet the necessary criteria for the application to run properly.
 */

import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  // Required variables
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required').startsWith('re_', 'RESEND_API_KEY must start with "re_"'),
  
  // Analytics (PostHog)
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional().refine(
    (val) => !val || val.startsWith('phc_'),
    'NEXT_PUBLIC_POSTHOG_KEY must start with "phc_" if provided'
  ),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  
  // SEO & Verification
  GOOGLE_SITE_VERIFICATION: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('https://hudsondigitalsolutions.com'),
  
  // n8n Integration (optional)
  N8N_WEBHOOK_URL: z.string().url().optional(),
  N8N_API_KEY: z.string().optional(),
  
  // Development & Testing
  NODE_ENV: z.enum(['development', 'test', 'production']).optional().default('development'),
  TEST_MODE: z.enum(['true', 'false']).optional().default('false'),
  DEBUG_WEB_VITALS: z.enum(['true', 'false']).optional().default('false'),
  
  // Security
  CSRF_SECRET: z.string().optional().refine(
    (val) => !val || val === 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' || val.length >= 32,
    'CSRF_SECRET must be at least 32 characters (or use placeholder)'
  ),
  CRON_SECRET: z.string().optional().refine(
    (val) => !val || val === 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' || val.length >= 32,
    'CRON_SECRET must be at least 32 characters (or use placeholder)'
  ),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/, 'RATE_LIMIT_WINDOW_MS must be a number').optional().default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/, 'RATE_LIMIT_MAX_REQUESTS must be a number').optional().default('5'),
});

type EnvConfig = z.infer<typeof envSchema>;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function validateEnvironment(): void {
  console.log(`${colors.cyan}🔍 Validating environment variables...${colors.reset}\n`);
  
  try {
    // Parse and validate environment variables
    const result = envSchema.safeParse(process.env);
    
    if (!result.success) {
      throw result.error;
    }
    
    const env = result.data;
    
    // Display validation results
    console.log(`${colors.green}✅ Environment validation successful!${colors.reset}\n`);
    
    // Show detected configuration
    console.log(`${colors.blue}📋 Configuration Summary:${colors.reset}`);
    console.log(`   Environment: ${colors.yellow}${env.NODE_ENV}${colors.reset}`);
    console.log(`   Test Mode: ${env.TEST_MODE === 'true' ? `${colors.yellow}Enabled${colors.reset}` : `${colors.green}Disabled${colors.reset}`}`);
    console.log(`   App URL: ${colors.cyan}${env.NEXT_PUBLIC_APP_URL}${colors.reset}`);
    
    // Check for optional configurations
    console.log(`\n${colors.blue}📦 Optional Features:${colors.reset}`);
    
    if (env.NEXT_PUBLIC_POSTHOG_KEY) {
      console.log(`   ✅ PostHog Analytics: ${colors.green}Configured${colors.reset}`);
    } else {
      console.log(`   ⚠️  PostHog Analytics: ${colors.yellow}Not configured${colors.reset}`);
    }
    
    if (env.N8N_WEBHOOK_URL && env.N8N_API_KEY) {
      console.log(`   ✅ n8n Integration: ${colors.green}Configured${colors.reset}`);
    } else {
      console.log(`   ⚠️  n8n Integration: ${colors.yellow}Not configured${colors.reset}`);
    }
    
    if (env.GOOGLE_SITE_VERIFICATION) {
      console.log(`   ✅ Google Search Console: ${colors.green}Configured${colors.reset}`);
    } else {
      console.log(`   ⚠️  Google Search Console: ${colors.yellow}Not configured${colors.reset}`);
    }
    
    // Security check
    console.log(`\n${colors.blue}🔒 Security Configuration:${colors.reset}`);
    
    if (env.CSRF_SECRET && env.CSRF_SECRET !== 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
      console.log(`   ✅ CSRF Protection: ${colors.green}Custom secret configured${colors.reset}`);
    } else if (env.CSRF_SECRET === 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
      console.log(`   ⚠️  CSRF Protection: ${colors.yellow}Using placeholder - update with real secret${colors.reset}`);
    } else {
      console.log(`   ⚠️  CSRF Protection: ${colors.yellow}Will use auto-generated secret${colors.reset}`);
    }
    
    if (env.CRON_SECRET && env.CRON_SECRET !== 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
      console.log(`   ✅ Cron Job Security: ${colors.green}Configured${colors.reset}`);
    } else if (env.CRON_SECRET === 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
      console.log(`   ⚠️  Cron Job Security: ${colors.yellow}Using placeholder - update with real secret${colors.reset}`);
    } else {
      console.log(`   ⚠️  Cron Job Security: ${colors.yellow}Not configured${colors.reset}`);
    }
    
    console.log(`   ✅ Rate Limiting: ${colors.green}${env.RATE_LIMIT_MAX_REQUESTS} requests per ${parseInt(env.RATE_LIMIT_WINDOW_MS) / 1000}s${colors.reset}`);
    
    // Warnings for production
    if (env.NODE_ENV === 'production') {
      console.log(`\n${colors.yellow}⚠️  Production Mode Checks:${colors.reset}`);
      
      if (!env.CSRF_SECRET) {
        console.log(`   ${colors.red}❌ CSRF_SECRET should be explicitly set in production${colors.reset}`);
      }
      
      if (!env.CRON_SECRET) {
        console.log(`   ${colors.red}❌ CRON_SECRET should be set if using cron jobs${colors.reset}`);
      }
      
      if (env.TEST_MODE === 'true') {
        console.log(`   ${colors.red}❌ TEST_MODE should be 'false' in production${colors.reset}`);
      }
      
      if (env.DEBUG_WEB_VITALS === 'true') {
        console.log(`   ${colors.yellow}⚠️  DEBUG_WEB_VITALS is enabled in production${colors.reset}`);
      }
    }
    
    console.log(`\n${colors.green}✨ Environment is properly configured!${colors.reset}`);
    process.exit(0);
    
  } catch (error: any) {
    console.error(`${colors.red}❌ Environment validation failed!${colors.reset}\n`);
    
    if (error instanceof z.ZodError || (error && error.errors && Array.isArray(error.errors))) {
      const errors = error.errors || error.issues || [];
      errors.forEach((err: any) => {
        const variable = err.path ? (Array.isArray(err.path) ? err.path.join('.') : err.path) : 'Unknown';
        console.error(`   ${colors.red}❌ ${variable}: ${err.message}${colors.reset}`);
      });
      
      console.log(`\n${colors.yellow}💡 Tips:${colors.reset}`);
      console.log(`   1. Copy .env.example to .env.local: ${colors.cyan}npm run env:setup${colors.reset}`);
      console.log(`   2. Update .env.local with your actual values`);
      console.log(`   3. Ensure all required variables are set`);
      console.log(`   4. Run validation again: ${colors.cyan}npm run env:validate${colors.reset}`);
      
      process.exit(1);
    } else {
      console.error(`${colors.red}Unexpected error during validation:${colors.reset}`);
      console.error(error);
      process.exit(1);
    }
  }
}

// Run validation
validateEnvironment();