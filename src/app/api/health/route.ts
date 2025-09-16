import { NextResponse, type NextRequest } from 'next/server';
import { createServerLogger, castError } from '@/lib/logger';

// Health check endpoint for monitoring
// Returns system status and basic metrics

export async function GET(_request: NextRequest) {
  const logger = createServerLogger('health-check');

  try {
    logger.info('Health check requested');
    // Check essential services
    const checks = {
      api: true,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      },
      version: process.env.npm_package_version || '0.1.0'
    };

    // Check environment variables (without exposing values)
    const requiredEnvVars = [
      'RESEND_API_KEY',
      'NEXT_PUBLIC_GA_MEASUREMENT_ID',
      'NEXT_PUBLIC_POSTHOG_KEY'
    ];

    const envStatus = requiredEnvVars.reduce((acc, varName) => {
      acc[varName] = !!process.env[varName];
      return acc;
    }, {} as Record<string, boolean>);

    // Overall health status
    const allEnvVarsSet = Object.values(envStatus).every(v => v);
    const status = allEnvVarsSet ? 'healthy' : 'degraded';

    return NextResponse.json({
      status,
      checks,
      env: envStatus,
      message: status === 'healthy'
        ? 'All systems operational'
        : 'Some services may be unavailable'
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error) {
    logger.error('Health check failed', castError(error));

    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }
}

// HEAD request for simple uptime monitoring
export async function HEAD(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}