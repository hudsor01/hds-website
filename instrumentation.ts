import { registerOTel } from '@vercel/otel'

export async function register() {
  // Initialize OpenTelemetry if available
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      // Register OpenTelemetry for Node.js runtime
      if (process.env.VERCEL || process.env.ENABLE_OTEL) {
        registerOTel('hudson-digital-solutions')
      }

      // Custom application monitoring setup
      await import('./lib/monitoring/app-monitoring')
      
      // Email service monitoring
      await import('./lib/monitoring/email-monitoring')

      console.log('✅ Instrumentation initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize instrumentation:', error)
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime specific monitoring
    try {
      await import('./lib/monitoring/edge-monitoring')
      console.log('✅ Edge runtime instrumentation initialized')
    } catch (error) {
      console.error('❌ Failed to initialize edge instrumentation:', error)
    }
  }
}