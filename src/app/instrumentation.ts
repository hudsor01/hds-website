/**
 * Next.js Instrumentation
 * This file runs before the app starts in both Node.js and Edge runtimes
 * Perfect for environment validation and initialization
 */

export async function register() {
  // Only run validation on server-side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Validate environment variables at startup
    const { initializeEnv } = await import('@/lib/validate-env');
    
    try {
      const env = initializeEnv();
      
      if (!env && process.env.NODE_ENV === 'production') {
        console.error('❌ Failed to validate environment variables in production');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Critical error during environment validation:', error);
      
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }
}