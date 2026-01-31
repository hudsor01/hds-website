import { NextResponse, type NextRequest } from 'next/server';
import { createServerLogger } from '@/lib/logger';
import { castError } from '@/lib/utils/errors'
import { env } from '@/env';

// Health check endpoint for monitoring
// Returns system status and basic metrics

export async function GET(_request: NextRequest) {
  const logger = createServerLogger('health-check');

  try {
    logger.info('Health check requested');
    // Check essential services
    const checks = {
      api: true,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      },
      version: env.npm_package_version || '0.1.0'
    };

    // Check environment variables (without exposing values)
    const envStatus = {
      RESEND_API_KEY: !!env.RESEND_API_KEY,
    };

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
